import PurchaseAccessRequestCard from "@/components/PurchaseAccessRequestCard";
import { getPurchasedWorkbookLinks, type StudyProduct } from "@/lib/products";
import { usageNotes } from "@/lib/usage-notes";

type SuccessPageViewProps = {
  product: StudyProduct | null;
  sessionId: string | null;
};

export function SuccessPageView({ product, sessionId }: SuccessPageViewProps) {
  const workbookLinks = product ? getPurchasedWorkbookLinks(product.slug) : [];
  const isSingleWorkbookCategory = workbookLinks.length === 1;

  return (
    <main className="min-h-screen w-full bg-[#19344a] px-0 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden">
          <div className="bg-[#19344a] px-5 py-6 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-sky-100 backdrop-blur sm:text-xs">
                  <span
                    aria-hidden="true"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-300/15 text-[11px] text-sky-100"
                  >
                    ✓
                  </span>
                  PAYMENT SUCCESS
                </div>
                <h1 className="mt-5 text-lg font-bold tracking-tight text-white sm:text-4xl">
                  ご購入ありがとうございました
                </h1>
                <p className="mt-4 text-xs leading-6 text-slate-300 sm:text-base sm:leading-7">
                  Stripe Checkout での決済が正常に完了しました。
                  {product ? `「${product.shortName}」` : "教材"}
                  のご購入が確定しています。学習を止めずに始められるよう、このページから次のアクションにそのまま進めます。
                </p>
              </div>

              <div className="grid gap-3 sm:min-w-[280px]">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.08] p-4 shadow-[0_12px_32px_rgba(2,6,23,0.18)] backdrop-blur sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100/70 sm:text-xs">
                    ご購入内容
                  </p>
                  <p className="mt-2 text-base font-semibold text-white sm:text-xl">
                    {product?.shortName ?? "教材"}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-300 sm:text-sm">
                    {product
                      ? `${product.category} / ${product.questionCount}`
                      : "購入情報を確認中です。"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
              <PurchaseAccessRequestCard sessionId={sessionId} />

              <section className="p-0 sm:rounded-[1.75rem] sm:border sm:border-white/10 sm:bg-white/[0.05] sm:p-6 sm:shadow-[0_12px_40px_rgba(2,6,23,0.2)] sm:backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75 sm:text-xs">
                  Notes
                </p>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-white sm:text-xl sm:font-semibold">
                  ■ 利用上の注意
                </h3>
                <ul className="mt-5 space-y-2">
                  {usageNotes.map((note) => (
                    <li
                      key={note}
                      className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6"
                    >
                      ・{note}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 sm:px-10 sm:py-6 lg:grid-cols-1">
            <div className="space-y-6">
              <section>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75 sm:text-xs">
                      Next Action
                    </p>
                    <h2 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-2xl sm:font-semibold">
                      {workbookLinks.length > 1
                        ? "暗記メーカーで各分野の問題集を開く"
                        : "購入した問題集を確認する"}
                    </h2>
                  </div>
                </div>

                {workbookLinks.length > 0 ? (
                  <div
                    className={`mt-6 grid gap-4 ${isSingleWorkbookCategory ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}
                  >
                    {workbookLinks.map((item, index) => (
                      <article
                        key={item.id}
                        className={`flex h-full flex-col p-0 transition duration-200 sm:rounded-[1.5rem] sm:border sm:border-white/10 sm:bg-white/[0.08] sm:p-5 sm:shadow-[0_12px_40px_rgba(2,6,23,0.2)] sm:backdrop-blur sm:hover:-translate-y-0.5 sm:hover:bg-white/[0.1] sm:hover:shadow-[0_18px_48px_rgba(2,6,23,0.28)] ${
                          isSingleWorkbookCategory ? "lg:p-7" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-300/10 text-sm font-semibold text-sky-100">
                            {index + 1}
                          </span>
                          <h3 className="text-base font-semibold text-white sm:text-lg">
                            {item.label}
                          </h3>
                        </div>
                        <p className="mt-4 text-xs leading-6 text-slate-300 sm:text-sm">
                          {item.description}
                        </p>

                        {item.childLinks?.length ? (
                          <div
                            className={`mt-5 space-y-3 ${
                              isSingleWorkbookCategory ? "lg:space-y-4" : ""
                            }`}
                          >
                            {item.childLinks.map((childLink) => (
                              <a
                                key={childLink.id}
                                href={childLink.href}
                                target="_blank"
                                rel="noreferrer"
                                className={`group block overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_16px_36px_rgba(15,23,42,0.11)] ${
                                  isSingleWorkbookCategory
                                    ? "lg:border-white/15 lg:bg-white lg:shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`flex min-h-[148px] flex-col justify-between px-4 py-4 text-slate-900 sm:px-5 sm:py-5 ${
                                    isSingleWorkbookCategory
                                      ? "lg:min-h-[124px] lg:flex-row lg:items-center lg:gap-6 lg:px-7 lg:py-6"
                                      : ""
                                  }`}
                                >
                                  <div className={isSingleWorkbookCategory ? "lg:flex-1" : ""}>
                                    <span
                                      className={`text-xs font-bold tracking-tight text-slate-950 sm:text-base ${
                                        isSingleWorkbookCategory ? "lg:text-lg" : ""
                                      }`}
                                    >
                                      {childLink.label}
                                    </span>
                                    <p
                                      className={`mt-3 text-xs leading-6 text-slate-600 sm:text-sm ${
                                        isSingleWorkbookCategory ? "lg:mt-2 lg:max-w-3xl" : ""
                                      }`}
                                    >
                                      {childLink.description}
                                    </p>
                                  </div>
                                  <div
                                    className={`mt-4 flex items-center gap-3 ${
                                      isSingleWorkbookCategory
                                        ? "lg:mt-0 lg:shrink-0"
                                        : ""
                                    }`}
                                  >
                                    <span
                                      className={`inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 ${
                                        isSingleWorkbookCategory
                                          ? "lg:bg-slate-950 lg:px-4 lg:py-2 lg:text-xs lg:text-white"
                                          : ""
                                      }`}
                                    >
                                      ankimaker.com
                                    </span>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-[11px] font-semibold text-slate-950 transition hover:bg-slate-100 sm:text-sm"
                            >
                              {item.label}の問題集を開く
                            </a>
                            <p className="mt-3 break-all text-xs leading-5 text-slate-400">
                              {item.href}
                            </p>
                          </>
                        )}
                      </article>
                    ))}
                  </div>
                ) : null}
              </section>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
