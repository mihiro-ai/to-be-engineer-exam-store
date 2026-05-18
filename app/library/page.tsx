import Link from "next/link";
import { db } from "@/lib/db";
import { getProductBySlug } from "@/lib/products";
import {
  getAccessibleWorkbookLinks,
  hashAccessToken,
  maskEmailAddress,
} from "@/lib/purchase-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LibraryPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen w-full bg-[#19344a] px-0 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden bg-[#19344a]">
          <div className="bg-[#19344a] px-5 py-6 sm:px-10 sm:py-10">
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 text-[11px] font-medium text-slate-300 transition hover:text-white sm:text-sm"
              >
                <span aria-hidden="true">←</span>
                トップページへ戻る
              </Link>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/80">
                  Buyer Library
                </p>
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-xs leading-5 text-slate-300 sm:text-base sm:leading-7">
                  {description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#19344a] px-5 sm:px-10">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 sm:text-xs">
                Purchase Access
              </p>
              <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
                専用リンクを再取得できます
              </h2>
              <p className="mt-3 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-7">
                購入時のメールアドレスが分かる場合は、購入済み教材ページへ戻るためのリンクをメールで受け取れます。
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/purchase-access"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800 sm:text-sm"
                >
                  メールから再取得する
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                >
                  トップページへ戻る
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <EmptyState
        title="購入者専用リンクが必要です"
        description="購入案内メール、または購入者向けリンク再取得ページから、購入者専用ページにアクセスしてください。"
      />
    );
  }

  const buyerAccess = await db.buyerAccess.findFirst({
    where: {
      accessTokenHash: hashAccessToken(token),
    },
    include: {
      purchases: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!buyerAccess) {
    return (
      <EmptyState
        title="リンクの有効期限が切れたか、無効になっています"
        description="購入者向けリンク再取得ページから、購入時のメールアドレスを使って新しいリンクを再送してください。"
      />
    );
  }

  const workbookLinks = getAccessibleWorkbookLinks(
    buyerAccess.purchases.map((purchase) => purchase.productSlug),
  );
  const isSingleWorkbookCategory = workbookLinks.length === 1;
  const workbookGridColumns =
    workbookLinks.length === 1
      ? "lg:grid-cols-1"
      : workbookLinks.length === 2
        ? "lg:grid-cols-2"
        : "lg:grid-cols-3";
  const purchases = buyerAccess.purchases.map((purchase) => ({
    ...purchase,
    product: getProductBySlug(purchase.productSlug),
  }));

  return (
    <main className="min-h-screen w-full bg-[#19344a] px-0 pb-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden bg-[#19344a]">
          <div className="bg-[#19344a] px-5 sm:px-10 py-6">
            <div>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/80">
                  Buyer Library
                </p>
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-4xl">
                  購入済み問題集ページ
                </h1>
                <p className="max-w-3xl text-xs leading-5 text-slate-300 sm:text-base sm:leading-7">
                  {maskEmailAddress(buyerAccess.email)}
                  に紐づく購入履歴をもとに、アクセス可能な問題集をまとめて表示しています。
                  ページを閉じても、同じ購入者専用リンクからいつでも戻れます。
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 bg-[#19344a] px-5 sm:px-10">
            <section>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75 sm:text-xs">
                  Workbook Access
                </p>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-2xl sm:font-semibold">
                  ここから学習を再開できます
                </h2>
                <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-300 sm:text-sm">
                  下記URLは現在ダミーですが、実運用では購入者向けの暗記メーカーURLに差し替えるだけで利用できます。
                </p>
              </div>

              <div className={`mt-6 grid gap-4 ${workbookGridColumns}`}>
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
                                  isSingleWorkbookCategory ? "lg:mt-0 lg:shrink-0" : ""
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
            </section>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 sm:text-xs">
                  Purchase History
                </p>
                <div className="mt-4 grid gap-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-xs font-semibold text-slate-950 sm:text-sm">
                        {purchase.product?.shortName ?? purchase.productName}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                        {purchase.paidAt.toLocaleDateString("ja-JP")} / 決済状態:{" "}
                        {purchase.paymentStatus}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_12px_40px_rgba(2,6,23,0.2)] backdrop-blur sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75 sm:text-xs">
                  Notes
                </p>
                <ul className="mt-4 grid gap-3">
                  <li className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-xs leading-5 text-slate-200 sm:text-sm sm:leading-6">
                    このリンクは購入者向けです。必要に応じて再発行できます。
                  </li>
                  <li className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-xs leading-5 text-slate-200 sm:text-sm sm:leading-6">
                    追加購入した場合も、同じメールアドレスなら同じページにまとまって表示できます。
                  </li>
                </ul>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/purchase-access"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-xs font-semibold text-slate-950 transition hover:bg-slate-100 sm:text-sm"
                  >
                    メールから再取得する
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
