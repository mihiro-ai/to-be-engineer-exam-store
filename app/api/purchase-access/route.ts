import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPurchaseAccessEmail } from "@/lib/email";
import { getProductBySlug } from "@/lib/products";
import {
  buildPurchaseAccessEmail,
  createAccessToken,
  maskEmailAddress,
  getPurchaseAccessUrl,
  hashAccessToken,
  normalizeEmail,
} from "@/lib/purchase-access";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getBaseUrl(request: Request) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const requestOrigin = trimTrailingSlash(new URL(request.url).origin);

  if (process.env.NODE_ENV !== "production") {
    return requestOrigin;
  }

  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  return requestOrigin;
}

function getStripeResourceId(value: { id: string } | string | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

async function findOrCreatePurchase(sessionId: string) {
  const existingPurchase = await db.purchase.findUnique({
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

  if (existingPurchase) {
    return existingPurchase;
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const product = getProductBySlug(session.metadata?.productSlug);
  const customerEmail = session.customer_details?.email ?? session.customer_email;

  if (!product) {
    throw new Error("購入対象の商品情報を復元できませんでした。");
  }

  if (!customerEmail) {
    throw new Error("購入者メールアドレスを確認できませんでした。");
  }

  if (session.payment_status !== "paid") {
    throw new Error("決済完了の確認が取れていません。数秒後に再度お試しください。");
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

  return db.purchase.findUnique({
    where: {
      stripeSessionId: session.id,
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
    email?: string;
  } | null;
  const sessionId = body?.sessionId?.trim();
  const email = body?.email?.trim();

  if (!sessionId && !email) {
    return NextResponse.json(
      { error: "購入セッションIDまたはメールアドレスが必要です。" },
      { status: 400 },
    );
  }

  const purchase = sessionId ? await findOrCreatePurchase(sessionId).catch(() => null) : null;

  if (sessionId && !purchase) {
    return NextResponse.json(
      {
        error:
          "決済情報を反映中です。数秒待ってから再度お試しください。",
      },
      { status: 202 },
    );
  }

  const buyerAccess = purchase
    ? purchase.buyerAccess
    : email
      ? await db.buyerAccess.findUnique({
          where: {
            email: normalizeEmail(email),
          },
          include: {
            purchases: {
              orderBy: {
                paidAt: "desc",
              },
            },
          },
        })
      : null;

  if (!buyerAccess || buyerAccess.purchases.length === 0) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      message: "該当する購入情報がありません。",
    });
  }

  const token = createAccessToken();
  const accessTokenHash = hashAccessToken(token);

  await db.buyerAccess.update({
    where: {
      id: buyerAccess.id,
    },
    data: {
      accessTokenHash,
      tokenIssuedAt: new Date(),
    },
  });

  const baseUrl = getBaseUrl(request);
  const accessUrl = getPurchaseAccessUrl(baseUrl, token);
  const emailPreview = buildPurchaseAccessEmail({
    accessUrl,
    purchases: buyerAccess.purchases.map((item) => ({
      productSlug: item.productSlug,
      productName: item.productName,
      paidAt: item.paidAt,
    })),
  });
  const deliveryResult = await sendPurchaseAccessEmail({
    to: buyerAccess.email,
    subject: emailPreview.subject,
    html: emailPreview.html,
    text: emailPreview.text,
  });

  return NextResponse.json({
    ok: true,
    delivered: deliveryResult.delivered,
    previewOnly: deliveryResult.previewOnly,
    sentTo: maskEmailAddress(buyerAccess.email),
    message: deliveryResult.delivered
      ? `${maskEmailAddress(buyerAccess.email)} 宛に購入者向けリンクを送信しました。`
      : "メール送信サービスが未設定のため、現在は送信プレビューのみ生成しています。",
    previewText: deliveryResult.previewOnly ? emailPreview.text : null,
  });
}
