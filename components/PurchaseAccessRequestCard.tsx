"use client";

import { useMemo, useState } from "react";

type PurchaseAccessRequestCardProps = {
  sessionId?: string | null;
};

type PurchaseAccessRequestResponse = {
  ok?: boolean;
  delivered?: boolean;
  previewOnly?: boolean;
  sentTo?: string;
  message?: string;
  error?: string;
  previewText?: string | null;
};

export default function PurchaseAccessRequestCard({
  sessionId = null,
}: PurchaseAccessRequestCardProps) {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const isSuccessPageVariant = Boolean(sessionId);
  const cardTitle = useMemo(
    () =>
      isSuccessPageVariant
        ? "購入者向けリンクをメールで受け取れます"
        : "メールアドレスから購入者向けリンクを再取得できます",
    [isSuccessPageVariant],
  );

  const cardDescription = useMemo(
    () =>
      isSuccessPageVariant
        ? "購入時に利用したメールアドレス宛に、購入済み教材ページへ戻るための専用リンクを送ります。ページを閉じても、メールからいつでも再入場できます。"
        : "購入時のメールアドレスを入力すると、該当する購入情報がある場合に専用リンクをメールで送信します。",
    [isSuccessPageVariant],
  );

  const sectionClassName = isSuccessPageVariant
    ? "rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_40px_rgba(2,6,23,0.2)] backdrop-blur sm:p-6"
    : "rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:p-7";

  const eyebrowClassName = isSuccessPageVariant
    ? "text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/75 sm:text-xs"
    : "text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 sm:text-xs";

  const titleClassName = isSuccessPageVariant
    ? "mt-3 text-lg font-bold tracking-tight text-white sm:text-xl sm:font-semibold"
    : "mt-3 text-lg font-bold tracking-tight text-slate-950 sm:text-2xl";

  const descriptionClassName = isSuccessPageVariant
    ? "mt-3 text-xs leading-6 text-slate-300 sm:text-sm"
    : "mt-3 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-7";

  const labelClassName = isSuccessPageVariant
    ? "block text-xs font-medium text-slate-200 sm:text-sm"
    : "block text-xs font-semibold text-slate-800 sm:text-sm";

  const inputClassName = isSuccessPageVariant
    ? "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-[11px] text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300/40 focus:ring-4 focus:ring-sky-300/10 sm:text-sm"
    : "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:text-sm";

  const primaryButtonClassName = isSuccessPageVariant
    ? "inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[11px] font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
    : "inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

  const helperTextClassName = isSuccessPageVariant
    ? "px-1 text-xs leading-6 text-slate-300/90 sm:text-sm"
    : "px-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-7";

  const messageBoxClassName = isSuccessPageVariant
    ? "mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.08] p-4"
    : "mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4";

  const messageTextClassName = isErrorMessage
    ? isSuccessPageVariant
      ? "text-xs leading-6 text-rose-300 sm:text-sm"
      : "text-xs leading-5 text-rose-600 sm:text-sm sm:leading-7"
    : isSuccessPageVariant
      ? "text-xs leading-6 text-slate-200 sm:text-sm"
      : "text-xs leading-5 text-slate-700 sm:text-sm sm:leading-7";

  const previewBoxClassName = isSuccessPageVariant
    ? "mt-5 rounded-[1.25rem] border border-white/10 bg-white/[0.08] p-4"
    : "mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4";

  const previewTitleClassName = isSuccessPageVariant
    ? "text-xs font-semibold text-white sm:text-sm"
    : "text-xs font-semibold text-slate-950 sm:text-sm";

  const previewDescriptionClassName = isSuccessPageVariant
    ? "mt-2 text-xs leading-6 text-slate-300 sm:text-sm"
    : "mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-7";

  const handleSubmit = async () => {
    if (!sessionId && !email.trim()) {
      setIsErrorMessage(true);
      setMessage("購入時のメールアドレスを入力してください。");
      return;
    }

    setIsPending(true);
    setMessage(null);
    setIsErrorMessage(false);
    setPreviewText(null);

    try {
      const response = await fetch("/api/purchase-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          sessionId
            ? { sessionId }
            : {
                email: email.trim(),
              },
        ),
      });

      const data = (await response.json().catch(() => null)) as PurchaseAccessRequestResponse | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "購入者向けメールを送信できませんでした。");
      }

      const nextMessage =
        data?.message ??
        "該当する購入情報がありません。";
      setIsErrorMessage(nextMessage === "該当する購入情報がありません。");
      setMessage(nextMessage);
      setPreviewText(data?.previewText ?? null);
    } catch (error) {
      setIsErrorMessage(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "購入者向けメールを送信できませんでした。",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className={sectionClassName}>
      <p className={eyebrowClassName}>
        Purchase Access
      </p>
      <h3 className={titleClassName}>
        {cardTitle}
      </h3>
      <p className={descriptionClassName}>
        {cardDescription}
      </p>

      {!isSuccessPageVariant ? (
        <div className="mt-5">
          <label className={labelClassName}>
            購入時のメールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isPending}
          className={primaryButtonClassName}
        >
          {isPending
            ? "送信中..."
            : isSuccessPageVariant
              ? "購入者向けリンクをメールで受け取る"
              : "購入者向けリンクをメールで送る"}
        </button>
        {isSuccessPageVariant ? (
          <p className={helperTextClassName}>
            このページを閉じてしまっても、トップページからメール送信で購入者向けリンクを再送できます。
          </p>
        ) : null}
      </div>

      {message ? (
        <div className={messageBoxClassName}>
          <p className={messageTextClassName}>{message}</p>
        </div>
      ) : null}

      {previewText ? (
        <div className={previewBoxClassName}>
          <p className={previewTitleClassName}>
            開発用メールプレビュー
          </p>
          <p className={previewDescriptionClassName}>
            `RESEND_API_KEY` と `PURCHASE_ACCESS_FROM_EMAIL` を設定すると、以下の内容が実際にメール送信されます。
          </p>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-[#0b1623] p-4 text-xs leading-6 text-slate-100">
            {previewText}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
