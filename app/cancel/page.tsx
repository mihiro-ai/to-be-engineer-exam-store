import { defaultProductSlug, getProductBySlug } from "@/lib/products";
import { CancelPageView } from "@/views/checkout/CancelPageView";

type CancelPageProps = {
  searchParams: Promise<{
    product?: string;
  }>;
};

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const { product: productSlug } = await searchParams;
  const product = getProductBySlug(productSlug) ?? getProductBySlug(defaultProductSlug);

  return <CancelPageView product={product} />;
}
