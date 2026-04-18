import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProductBySlug } from "@/lib/products";

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

function getAbsoluteUrl(baseUrl: string, path: string) {
  return new URL(path, `${baseUrl}/`).toString();
}

function getProductPageUrl(baseUrl: string, productSlug: string) {
  return getAbsoluteUrl(baseUrl, `/products/${productSlug}`);
}

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Stripe の秘密鍵")) {
      return error.message;
    }

    if (/Invalid API Key provided/i.test(error.message)) {
      return "Stripe の秘密鍵が無効です。.env.local の STRIPE_SECRET_KEY を正しい値に更新し、開発サーバーを再起動してください。";
    }
  }

  return "チェックアウトの作成に失敗しました。";
}

export async function POST(request: Request) {
  try {
    const baseUrl = getBaseUrl(request);
    const body = (await request.json().catch(() => null)) as {
      productSlug?: string;
    } | null;
    const product = getProductBySlug(body?.productSlug);

    if (!product) {
      return NextResponse.json(
        { error: "購入対象の商品が見つかりませんでした。" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.amount,
            product_data: {
              name: product.name,
              description: product.description,
              images: [getAbsoluteUrl(baseUrl, product.imagePath)],
            },
          },
        },
      ],
      metadata: {
        productSlug: product.slug,
        productName: product.name,
      },
      success_url: `${baseUrl}/success?product=${product.slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: getProductPageUrl(baseUrl, product.slug),
    });

    if (!session.url) {
      throw new Error("Stripe Checkout の URL を取得できませんでした。");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: getCheckoutErrorMessage(error) },
      { status: 500 },
    );
  }
}
