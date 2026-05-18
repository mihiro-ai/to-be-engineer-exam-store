import Stripe from "stripe";
import { db } from "@/lib/db";
import { getProductBySlug } from "@/lib/products";
import { normalizeEmail } from "@/lib/purchase-access";

function getStripeResourceId(value: { id: string } | string | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export async function findPurchaseByStripeSessionId(sessionId: string) {
  return db.purchase.findUnique({
    where: {
      stripeSessionId: sessionId,
    },
    include: {
      buyerAccess: {
        include: {
          purchases: {
            orderBy: {
              paidAt: "desc",
            },
          },
        },
      },
    },
  });
}

export async function findPurchaseByEmailAndProductSlug(
  email: string,
  productSlug: string,
) {
  return db.purchase.findFirst({
    where: {
      customerEmail: normalizeEmail(email),
      productSlug,
    },
    orderBy: {
      paidAt: "desc",
    },
  });
}

export async function upsertPurchaseFromStripeSession(
  session: Stripe.Checkout.Session,
  fallbackCustomerEmail?: string | null,
) {
  const product = getProductBySlug(session.metadata?.productSlug);
  const customerEmail =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.customerEmail ??
    fallbackCustomerEmail;

  if (!product) {
    throw new Error("購入対象の商品情報を復元できませんでした。");
  }

  if (!customerEmail) {
    throw new Error("購入者メールアドレスを確認できませんでした。");
  }

  if (session.payment_status !== "paid") {
    throw new Error("決済完了の確認が取れていません。");
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

  return findPurchaseByStripeSessionId(session.id);
}
