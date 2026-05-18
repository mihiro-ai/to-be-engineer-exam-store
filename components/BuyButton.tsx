"use client";

import { type FormEvent, useState } from "react";
import type { ProductSlug } from "@/lib/products";

type BuyButtonProps = {
  productSlug: ProductSlug;
  label?: string;
};

export default function BuyButton({
  productSlug,
  label = "この教材を購入する",
}: BuyButtonProps) {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const customerEmail = email.trim();

      if (!customerEmail) {
        throw new Error("メールアドレスを入力してください。");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productSlug, customerEmail }),
      });

      const data = (await response.json()) as { error?: string; url?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Stripe Checkout を開始できませんでした。");
      }

      window.location.href = data.url;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Stripe Checkout を開始できませんでした。",
      );
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        メールアドレス
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          disabled={isPending}
          className="h-12 rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        />
        <span className="text-xs font-medium leading-5 text-slate-500">
          購入後の教材アクセス案内に使用します。
        </span>
      </label>
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 px-6 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-400/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
      >
        {isPending ? "遷移中..." : label}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}
