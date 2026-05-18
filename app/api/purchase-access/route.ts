import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPurchaseAccessEmail } from "@/lib/email";
import {
  buildPurchaseAccessEmail,
  createAccessToken,
  maskEmailAddress,
  getPurchaseAccessUrl,
  hashAccessToken,
  normalizeEmail,
} from "@/lib/purchase-access";
import {
  findPurchaseByStripeSessionId,
  upsertPurchaseFromStripeSession,
} from "@/lib/purchases";
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

async function findBuyerAccessByEmail(email: string) {
  return db.buyerAccess.findUnique({
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
  });
}

async function findOrCreatePurchase(sessionId: string) {
  const existingPurchase = await findPurchaseByStripeSessionId(sessionId);

  if (existingPurchase) {
    return existingPurchase;
  }

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  await upsertPurchaseFromStripeSession(session);

  return findPurchaseByStripeSessionId(session.id);
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
      ? await findBuyerAccessByEmail(email)
      : null;

  if (!buyerAccess || buyerAccess.purchases.length === 0) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      reason: "purchaseNotFound",
      message:
        "入力されたメールアドレスの購入情報がありません。購入時に使用した別のメールアドレスでお試しください。",
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

  const maskedRecipient = maskEmailAddress(buyerAccess.email);
  let message: string;

  if (deliveryResult.delivered) {
    message =
      `${maskedRecipient} 宛へ購入者向けリンクの送信を受け付けました。` +
      `数分経っても届かない場合は迷惑メールフォルダをご確認のうえ、` +
      `会社・学校ドメインでは受信側のフィルタで届かないことがあります。` +
      `別のメールアドレスで購入している場合は、そのアドレスで再取得をお試しください。`;
  } else if (deliveryResult.sendFailed) {
    message =
      "メール送信に失敗しました。しばらくしてから再度お試しください。Resend のダッシュボードでドメイン認証・送信元アドレスを確認してください。";
  } else {
    message =
      "メール送信に必要な環境変数（RESEND_API_KEY / PURCHASE_ACCESS_FROM_EMAIL）がサーバーで読み込めていません。Vercel などの本番・プレビュー環境では Project Settings → Environment Variables に両方を追加し、その環境向けに再デプロイしてください。";
  }

  return NextResponse.json({
    ok: true,
    delivered: deliveryResult.delivered,
    previewOnly: deliveryResult.previewOnly,
    sentTo: maskedRecipient,
    message,
    previewText: deliveryResult.previewOnly ? emailPreview.text : null,
  });
}
