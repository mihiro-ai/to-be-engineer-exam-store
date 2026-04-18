import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProductBySlug } from "@/lib/products";
import { normalizeEmail } from "@/lib/purchase-access";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookVerificationErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Stripe Webhook の署名シークレット")) {
      return {
        message: error.message,
        status: 500,
      };
    }
  }

  return {
    message: "Stripe Webhook の署名検証に失敗しました。",
    status: 400,
  };
}

function getStripeResourceId(value: { id: string } | string | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const product = getProductBySlug(session.metadata?.productSlug);
  const customerEmail = session.customer_details?.email ?? session.customer_email;

  if (!product) {
    console.warn("Stripe checkout.session.completed skipped: unknown product", {
      sessionId: session.id,
      productSlug: session.metadata?.productSlug ?? null,
    });
    return;
  }

  if (!customerEmail) {
    console.warn("Stripe checkout.session.completed skipped: missing customer email", {
      sessionId: session.id,
      productSlug: product.slug,
    });
    return;
  }

  const normalizedEmail = normalizeEmail(customerEmail);
  const buyerAccess = await db.buyerAccess.upsert({
    where: {
      email: normalizedEmail,
    },
    update: {},
    create: {
      email: normalizedEmail,
    },
  });

  await db.purchase.upsert({
    where: {
      stripeSessionId: session.id,
    },
    update: {
      stripePaymentIntent: getStripeResourceId(
        session.payment_intent as { id: string } | string | null | undefined,
      ),
      stripeCustomerId: getStripeResourceId(
        session.customer as { id: string } | string | null | undefined,
      ),
      customerEmail: normalizedEmail,
      productSlug: product.slug,
      productName: product.name,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      paidAt: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000),
      buyerAccessId: buyerAccess.id,
    },
    create: {
      stripeSessionId: session.id,
      stripePaymentIntent: getStripeResourceId(
        session.payment_intent as { id: string } | string | null | undefined,
      ),
      stripeCustomerId: getStripeResourceId(
        session.customer as { id: string } | string | null | undefined,
      ),
      customerEmail: normalizedEmail,
      productSlug: product.slug,
      productName: product.name,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      paidAt: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000),
      buyerAccessId: buyerAccess.id,
    },
  });

  console.info("Stripe checkout.session.completed received", {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    productSlug: product.slug,
    productName: product.name,
    customerEmail: normalizedEmail,
    buyerAccessId: buyerAccess.id,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe-Signature ヘッダーが見つかりませんでした。" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    const { message, status } = getWebhookVerificationErrorMessage(error);

    return NextResponse.json({ error: message }, { status });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(event);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
