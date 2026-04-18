import Image from "next/image";
import Link from "next/link";
import { products, type StudyProduct } from "@/lib/products";
import { formatPrice } from "@/lib/stripe";

const guidanceSteps = [
  "トップページで4商品の違いをざっくり把握",
  "例題・価格を確認して、気になる商品ページを開く",
  "商品ページから Stripe Checkout で購入",
];

const exampleProducts = products.filter(
  (product): product is StudyProduct & { freeTrialUrl: string } =>
    Boolean(product.freeTrialUrl),
);

export function HomePageView() {
  return (
    <main className="min-h-screen w-full bg-[#19344a]">
      <div className="relative isolate">
        <div className="mx-auto flex min-h-screen w-full max-w-[90rem] flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
          <section className="relative px-2 py-3 sm:px-2 sm:py-4 lg:px-2 lg:py-4">
            <div className="relative space-y-8 xl:grid xl:grid-cols-[minmax(0,3fr)_minmax(320px,1.4fr)] xl:gap-8 xl:space-y-0">
              <div className="space-y-2">
                <div className="max-w-5xl space-y-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/90 sm:text-sm sm:tracking-[0.28em]">
                    To-Be Engineer Study Packs
                  </p>
                  <h1 className="text-lg font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    To-Beエンジニア試験対策オリジナル問題集
                  </h1>
                  <p className="max-w-4xl text-xs leading-6 text-slate-300 sm:text-lg sm:leading-7">
                    技術者としての基礎力を分野横断で確認するための試験に向けて、
                    機械・電気電子・情報の3分野を整理しながら学べる問題集です。
                    公式テキストを読むだけでは定着しにくい内容を、テンポよく反復できる形にまとめています。
                  </p>
                </div>

                <div className="relative w-full max-w-4xl">
                  <div
                    aria-hidden="true"
                    className="absolute inset-6 rounded-[2.5rem] bg-sky-300/15 blur-3xl"
                  />
                  <div className="relative overflow-hidden rounded-[1.5rem] shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:rounded-[1.75rem]">
                    <Image
                      src="/LP.jpg"
                      alt="To-Beエンジニア試験対策で扱う教材イメージ"
                      width={1600}
                      height={900}
                      priority
                      className="block h-auto w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col justify-start xl:pt-10">
                {guidanceSteps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className="w-full rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur sm:p-5">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <p className="text-[11px] font-medium tracking-[0.18em] text-slate-300 sm:text-sm sm:tracking-[0.2em]">
                          STEP {index + 1}
                        </p>
                      </div>
                      <p className="mt-3 text-xs font-semibold leading-5 text-white sm:mt-4 sm:text-base sm:leading-7">
                        {step}
                      </p>
                    </div>

                    {index < guidanceSteps.length - 1 ? (
                      <div
                        aria-hidden="true"
                        className="flex h-10 items-center justify-center sm:h-12"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-sky-300/25 bg-sky-300/10 text-sky-100 shadow-[0_10px_24px_rgba(56,189,248,0.14)] sm:h-10 sm:w-10">
                          <span className="text-base leading-none sm:text-xl">↓</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
                  <a
                    href="https://note.com/fast_snake2749/n/n64f57c9f3099"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-5 text-[11px] font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-400/25 sm:h-12 sm:px-6 sm:text-sm"
                  >
                    noteで詳しく見る
                  </a>
                  <Link
                    href="/purchase-access"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 bg-white/8 px-5 text-[11px] font-semibold text-white transition hover:bg-white/12 sm:h-12 sm:px-6 sm:text-sm"
                  >
                    購入済み教材をメールから再取得する
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section
            id="lineup"
            className="px-0 py-3 sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:bg-white/[0.04] sm:p-8 sm:backdrop-blur lg:p-10"
          >
            <div className="max-w-3xl space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/75 sm:text-sm sm:tracking-[0.2em]">
                Product Lineup
              </p>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                自分に合った問題集を選べます
              </h2>
              <p className="text-xs leading-6 text-slate-300 sm:text-base sm:leading-7">
                まとめて学べるセット商品と、分野ごとに選べる個別商品を用意しています。各カードから、
                内容や価格を確認してそのまま購入できます。
              </p>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.slug}
                  className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_12px_40px_rgba(2,6,23,0.18)] backdrop-blur sm:p-7"
                >
                  <h3 className="mt-1 text-lg font-semibold text-white sm:mt-2 sm:text-2xl">
                    {product.shortName}
                  </h3>
                  <p className="mt-2 text-[11px] leading-5 text-slate-300 sm:mt-3 sm:text-sm sm:leading-6">
                    {product.description}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3 lg:grid-cols-1">
                    <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
                      <p className="text-[10px] leading-4 text-slate-400 sm:text-sm">対象分野</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white sm:text-base">
                        {product.category}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
                      <p className="text-[10px] leading-4 text-slate-400 sm:text-sm">問題数</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white sm:text-base">
                        {product.questionCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-3 sm:rounded-2xl sm:px-4 sm:py-4">
                      <p className="text-[10px] leading-4 text-slate-400 sm:text-sm">価格</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white sm:text-base">
                        {formatPrice(product.amount, product.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-[11px] font-semibold text-slate-950 transition hover:bg-slate-100 sm:h-11 sm:text-sm"
                    >
                      詳細ページを見る
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="examples"
            className="px-0 py-3 sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:bg-white/[0.04] sm:shadow-[0_20px_60px_rgba(2,6,23,0.2)] sm:p-8 sm:backdrop-blur lg:p-10"
          >
            <div className="max-w-3xl space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/75 sm:text-sm sm:tracking-[0.2em]">
                Example Questions
              </p>
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-2xl">
                各分野の例題をそのまま試せます
              </h2>
              <p className="text-xs leading-6 text-slate-300 sm:text-base sm:leading-7">
                note の無料お試し案内と同じく、機械・電気電子・情報の各分野ごとに
                暗記メーカーの例題ページへ移動できます。まずは各10問の例題で、問題の粒度や学習感を確認してください。
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {exampleProducts.map((product) => {
                const preview = product.sampleQuestions[0];

                return (
                  <article key={product.slug} className="space-y-3">
                    <a
                      href={product.freeTrialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group block h-full overflow-hidden rounded-[1.5rem] border border-white/12 bg-white shadow-[0_16px_48px_rgba(2,6,23,0.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(2,6,23,0.3)]"
                    >
                      <div className="flex min-h-[168px] flex-col justify-between bg-white px-5 py-5 text-slate-900 sm:min-h-[180px] sm:px-6 sm:py-6 lg:min-h-[160px] lg:px-5 lg:py-5 xl:min-h-[172px] xl:px-6 xl:py-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-base font-bold tracking-tight sm:text-xl lg:text-[1.1rem] xl:text-xl">
                            {product.category} 例題 | 暗記メーカー
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                            10問・無料
                          </span>
                        </div>
                        <p className="mt-4 line-clamp-2 text-xs leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-[0.95rem] lg:leading-7 xl:text-base">
                          {preview.question}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-700 sm:text-lg lg:text-base xl:text-lg">
                            ankimaker.com
                          </p>
                          <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-2 text-[11px] font-semibold text-sky-700 transition group-hover:bg-sky-100">
                            例題ページを開く
                          </span>
                        </div>
                      </div>
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
