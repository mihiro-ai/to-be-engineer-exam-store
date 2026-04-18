import Link from "next/link";
import PurchaseAccessRequestCard from "@/components/PurchaseAccessRequestCard";

export default function PurchaseAccessPage() {
  return (
    <main className="min-h-screen w-full bg-[#19344a]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 sm:py-10">
        <section className="overflow-hidden bg-[#19344a]">
          <div className="bg-[#19344a] px-2 py-6 sm:px-10 sm:py-10">
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
                  Purchase Recovery
                </p>
                <h1 className="text-lg font-bold tracking-tight text-white sm:text-4xl">
                  購入済み教材ページをメールから再取得する
                </h1>
                <p className="max-w-3xl text-xs leading-5 text-slate-300 sm:text-base sm:leading-7">
                  購入時のメールアドレスを入力すると、購入済み教材ページへ戻るための専用リンクをメールで送信します。
                  教材ページを閉じてしまっても、メールからいつでも再入場できます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#19344a] px-2 sm:px-10">
            <PurchaseAccessRequestCard />
          </div>
        </section>
      </div>
    </main>
  );
}
