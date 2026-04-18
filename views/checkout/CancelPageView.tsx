import Link from "next/link";
import { type StudyProduct } from "@/lib/products";

type CancelPageViewProps = {
  product: StudyProduct | null;
};

export function CancelPageView({ product }: CancelPageViewProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-[2rem] border border-amber-200 bg-white p-10 text-center shadow-xl shadow-amber-100/60">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">
          !
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          購入手続きは完了していません
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          まだ{product ? `「${product.shortName}」` : "教材"}の購入は確定していません。
          内容を見直して問題なければ、商品ページからもう一度 Checkout を開始できます。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {product ? (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-amber-300 px-6 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
            >
              商品ページへ戻る
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            一覧ページへ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
