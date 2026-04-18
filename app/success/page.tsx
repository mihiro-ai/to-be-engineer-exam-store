import { defaultProductSlug, getProductBySlug } from "@/lib/products";
import { SuccessPageView } from "@/views/checkout/SuccessPageView";

type SuccessPageProps = {
  searchParams: Promise<{
    product?: string;
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { product: productSlug, session_id: sessionId } = await searchParams;
  const product = getProductBySlug(productSlug) ?? getProductBySlug(defaultProductSlug);

  return <SuccessPageView product={product} sessionId={sessionId ?? null} />;
}
