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
    <main className="min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_28px_90px_rgba(16,24,40,0.18)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Purchase Library
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            一覧ページへ戻る
          </Link>
        </div>
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
  const purchases = buyerAccess.purchases.map((purchase) => ({
    ...purchase,
    product: getProductBySlug(purchase.productSlug),
  }));

  return (
    <main className="min-h-screen w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-sky-200/70 bg-white shadow-[0_28px_90px_rgba(16,24,40,0.18)]">
          <div className="bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_35%,#ecfeff_100%)] px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
              Buyer Library
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              購入済み問題集ページ
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {maskEmailAddress(buyerAccess.email)}
              に紐づく購入履歴をもとに、アクセス可能な問題集をまとめて表示しています。
              ページを閉じても、同じ購入者専用リンクからいつでも戻れます。
            </p>
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-10 sm:py-10 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Workbook Access
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  ここから学習を再開できます
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  下記URLは現在ダミーですが、実運用では購入者向けの暗記メーカーURLに差し替えるだけで利用できます。
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {workbookLinks.map((link) => (
                  <article
                    key={link.id}
                    className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-slate-950">
                      {link.label}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {link.description}
                    </p>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      問題集を開く
                    </a>
                    <p className="mt-3 break-all text-xs leading-5 text-slate-400">
                      {link.href}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Purchase History
                </p>
                <div className="mt-4 grid gap-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {purchase.product?.shortName ?? purchase.productName}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {purchase.paidAt.toLocaleDateString("ja-JP")} / 決済状態:{" "}
                        {purchase.paymentStatus}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Notes
                </p>
                <ul className="mt-4 grid gap-3">
                  <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    このリンクは購入者向けです。必要に応じて再発行できます。
                  </li>
                  <li className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    追加購入した場合も、同じメールアドレスなら同じページにまとまって表示できます。
                  </li>
                </ul>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    一覧ページへ戻る
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
