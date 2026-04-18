import Stripe from "stripe";

const STRIPE_SECRET_KEY_PATTERN = /^sk_(test|live)_/;
const STRIPE_WEBHOOK_SECRET_PATTERN = /^whsec_/;

let stripeClient: Stripe | null = null;

function getStripeSecretKey() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "Stripe の秘密鍵が未設定です。.env.local に STRIPE_SECRET_KEY を設定し、開発サーバーを再起動してください。",
    );
  }

  if (!STRIPE_SECRET_KEY_PATTERN.test(secretKey)) {
    throw new Error(
      "Stripe の秘密鍵の形式が不正です。.env.local の STRIPE_SECRET_KEY に、Stripe Dashboard の sk_test_ または sk_live_ から始まる秘密鍵を設定してください。",
    );
  }

  return secretKey;
}

export function getStripeWebhookSecret() {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    throw new Error(
      "Stripe Webhook の署名シークレットが未設定です。.env.local に STRIPE_WEBHOOK_SECRET を設定し、開発サーバーを再起動してください。",
    );
  }

  if (!STRIPE_WEBHOOK_SECRET_PATTERN.test(webhookSecret)) {
    throw new Error(
      "Stripe Webhook の署名シークレットの形式が不正です。.env.local の STRIPE_WEBHOOK_SECRET に、Stripe Dashboard の whsec_ から始まる値を設定してください。",
    );
  }

  return webhookSecret;
}

export function getStripe() {
  const secretKey = getStripeSecretKey();

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function formatPrice(amount: number, currency: string) {
  const normalizedCurrency = currency.toLowerCase();
  const isZeroDecimalCurrency = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]).has(
    normalizedCurrency,
  );

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: normalizedCurrency,
  }).format(isZeroDecimalCurrency ? amount : amount / 100);
}
