import Image from "next/image";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";
import { type StudyProduct } from "@/lib/products";
import { formatPrice } from "@/lib/stripe";
import { usageNotes } from "@/lib/usage-notes";

type ProductDetailPageViewProps = {
  product: StudyProduct;
  relatedProducts: StudyProduct[];
};

function getPurchaseSteps(slug: StudyProduct["slug"]) {
  if (slug === "full-set") {
    return [
      "このページで商品の概要と対象分野を確認",
      "全分野セットを Stripe Checkout で購入",
      "購入後の案内に沿って本編問題集へアクセス",
    ];
  }

  return [
    "このページで内容と例題を確認",
    "分野別版を Stripe Checkout で購入",
    "購入後の案内に沿って教材へアクセス",
  ];
}

export function ProductDetailPageView({
  product,
  relatedProducts,
}: ProductDetailPageViewProps) {
  const purchaseSteps = getPurchaseSteps(product.slug);
  const isFullSet = product.slug === "full-set";

  return (
    <main className="min-h-screen w-full bg-[#19344a]">
      <div className="relative isolate">
        <div className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col gap-3 px-4 py-2 sm:gap-6 sm:px-6 sm:py-2 lg:px-10 lg:py-2">
          <section className="px-0 py-2 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10">
              <div className="mt-2 space-y-5 sm:mt-4 sm:space-y-8">
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="inline-flex w-fit items-center gap-2 text-[11px] font-medium text-slate-300 transition hover:text-white sm:text-sm"
                  >
                    <span aria-hidden="true">←</span>
                    トップページに戻る
                  </Link>
                  <h1 className="max-w-4xl text-lg font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                    {product.shortName}
                  </h1>
                  <p className="max-w-3xl text-xs leading-5 text-slate-300 sm:text-lg sm:leading-7">
                    {product.longDescription}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur sm:rounded-[1.75rem] sm:p-5">
                    <p className="text-[10px] leading-4 text-slate-300 sm:text-sm">価格</p>
                    <p className="mt-1 text-lg font-semibold leading-5 text-white sm:mt-2 sm:text-2xl">
                      {formatPrice(product.amount, product.currency)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur sm:rounded-[1.75rem] sm:p-5">
                    <p className="text-[10px] leading-4 text-slate-300 sm:text-sm">問題数</p>
                    <p className="mt-1 text-lg font-semibold leading-5 text-white sm:mt-2 sm:text-2xl">
                      {product.questionCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur sm:rounded-[1.75rem] sm:p-5">
                    <p className="text-[10px] leading-4 text-slate-300 sm:text-sm">
                      {isFullSet ? "学習形式" : "対象分野"}
                    </p>
                    <p className="mt-1 text-lg font-semibold leading-5 text-white sm:mt-2 sm:text-2xl">
                      {isFullSet ? "一問一答" : product.category}
                    </p>
                  </div>
                </div>

                <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
                  <h2 className="text-base font-semibold leading-tight text-white sm:text-xl">
                    ■ ご利用にあたっての注意
                  </h2>
                  <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2.5">
                    {usageNotes.map((note) => (
                      <li
                        key={note}
                        className="text-xs leading-[1.15rem] text-slate-200 sm:text-base sm:leading-7"
                      >
                        ・{note}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-4 rounded-[2rem] bg-sky-300/15 blur-3xl"
                />
                <aside className="relative rounded-[2rem] border border-white/10 bg-white/[0.94] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur sm:rounded-[2.25rem] sm:p-5">
                  <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] p-3 sm:rounded-[1.75rem] sm:p-6">
                    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-100 shadow-inner">
                      <Image
                        src={product.imagePath}
                        alt={product.name}
                        width={1200}
                        height={1200}
                        priority
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 px-2 py-4 sm:space-y-5 sm:px-5 sm:py-6">
                    <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-4 sm:rounded-[1.5rem]">
                      <p className="text-[11px] font-medium text-slate-500 sm:text-sm">
                        購入の流れ
                      </p>
                      <ol className="mt-3 space-y-2.5">
                        {purchaseSteps.map((step, index) => (
                          <li
                            key={step}
                            className="flex gap-2.5 text-[11px] text-slate-700 sm:gap-3 sm:text-sm"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                              {index + 1}
                            </span>
                            <span className="pt-0.5 leading-[1.125rem] sm:leading-6">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-[1.5rem] sm:p-5">
                      <p className="text-[10px] leading-4 text-slate-500 sm:text-sm">価格</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                        {formatPrice(product.amount, product.currency)}
                      </p>
                      <p className="mt-2 text-[11px] leading-[1.125rem] text-slate-500 sm:text-sm sm:leading-6">
                        決済内容は Stripe Checkout 画面でも確認できます。
                      </p>
                    </div>

                    <BuyButton
                      productSlug={product.slug}
                      label={`${product.shortName}を購入する`}
                    />
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="px-0 py-2 sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:bg-white/[0.04] sm:p-8 sm:shadow-[0_20px_60px_rgba(2,6,23,0.2)] sm:backdrop-blur lg:p-10">
            <div className="max-w-3xl space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/75 sm:text-sm sm:tracking-[0.2em]">
                {isFullSet ? "Field Purchase" : "Other Products"}
              </p>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                {isFullSet ? "分野別購入について" : "他の商品もあわせて比較できます"}
              </h2>
              <p className="text-xs leading-5 text-slate-300 sm:text-base sm:leading-7">
                {isFullSet
                  ? "特定分野のみ必要な方は、分野別販売もあります。必要な分野だけを選びたい場合は下記から比較できます。分野別よりセットの方がお得です。"
                  : "必要な分野だけに絞るか、全分野セットで横断的に学ぶかを比較しやすいよう、関連商品も一覧で掲載しています。"}
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <article
                  key={relatedProduct.slug}
                  className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-4 shadow-sm sm:rounded-[2rem] sm:p-7"
                >
                  <h3 className="text-lg font-semibold text-slate-950 sm:text-xl">
                    {relatedProduct.shortName}
                  </h3>
                  <p className="mt-1.5 flex-1 text-[11px] leading-[1.125rem] text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
                    {relatedProduct.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3">
                      <p className="text-[10px] leading-4 text-slate-500 sm:text-sm">価格</p>
                      <p className="mt-1 text-xs font-semibold leading-4 text-slate-950 sm:text-base sm:leading-5">
                        {formatPrice(relatedProduct.amount, relatedProduct.currency)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3">
                      <p className="text-[10px] leading-4 text-slate-500 sm:text-sm">問題数</p>
                      <p className="mt-1 text-xs font-semibold leading-4 text-slate-950 sm:text-base sm:leading-5">
                        {relatedProduct.questionCount}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/products/${relatedProduct.slug}`}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-slate-300 px-5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:h-11 sm:text-sm"
                  >
                    この商品を見る
                  </Link>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
