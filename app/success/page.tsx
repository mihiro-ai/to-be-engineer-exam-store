import { defaultProductSlug, getProductBySlug } from "@/lib/products";
import { upsertPurchaseFromStripeSession } from "@/lib/purchases";
import { getStripe } from "@/lib/stripe";
import { SuccessPageView } from "@/views/checkout/SuccessPageView";

type SuccessPageProps = {
  searchParams: Promise<{
    product?: string;
    session_id?: string;
  }>;
};

async function syncPurchaseFromSession(sessionId: string | null) {
  if (!sessionId) {
    return;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    await upsertPurchaseFromStripeSession(session);
  } catch (error) {
    console.warn("購入完了ページで購入情報を保存できませんでした。", {
      sessionId,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { product: productSlug, session_id: sessionId } = await searchParams;
  const product = getProductBySlug(productSlug) ?? getProductBySlug(defaultProductSlug);
  await syncPurchaseFromSession(sessionId ?? null);

  return <SuccessPageView product={product} sessionId={sessionId ?? null} />;
}
