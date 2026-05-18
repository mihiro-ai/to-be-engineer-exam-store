import Stripe from "stripe";
import { NextResponse } from "next/server";
import { upsertPurchaseFromStripeSession } from "@/lib/purchases";
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

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const purchase = await upsertPurchaseFromStripeSession(session).catch((error) => {
    console.warn("Stripe checkout.session.completed skipped", {
      sessionId: session.id,
      productSlug: session.metadata?.productSlug ?? null,
      error: error instanceof Error ? error.message : "unknown error",
    });

    return null;
  });

  if (!purchase) {
    return;
  }

  console.info("Stripe checkout.session.completed received", {
    sessionId: session.id,
    paymentStatus: purchase.paymentStatus,
    productSlug: purchase.productSlug,
    productName: purchase.productName,
    customerEmail: purchase.customerEmail,
    buyerAccessId: purchase.buyerAccessId,
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
