# To-Beエンジニア試験対策ストア

Stripe Checkout で教材を販売し、購入後にメール経由で購入者専用リンクを再送できる Next.js アプリです。

## セットアップ

1. `.env.example` をもとに `.env.local` を作成します。
2. 依存関係をインストールします。
3. Prisma Client を生成し、必要ならローカル Postgres にマイグレーションを適用します。
4. 開発サーバーを起動します。

```bash
npm install
npm run db:migrate:dev
npm run dev
```

ローカルでまだ DB を作らない段階なら、`db:migrate:dev` はスキップしても画面開発は可能です。

## 必要な環境変数

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_BASE_URL`
- `RESEND_API_KEY`
- `PURCHASE_ACCESS_FROM_EMAIL`
- `SQLITE_MIGRATION_DATABASE_URL` (`SQLite` から既存データを移す場合のみ)

`RESEND_API_KEY` と `PURCHASE_ACCESS_FROM_EMAIL` を設定すると、購入者向けリンクを実際にメール送信できます。未設定の環境では、画面上にメール本文プレビューを表示します。

## Postgres / Neon 前提の開発

`DATABASE_URL` には Postgres または Neon の接続URLを設定してください。

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

スキーマ変更後の基本コマンドは次のとおりです。

```bash
npm run db:generate
npm run db:migrate:dev
```

本番環境へマイグレーションを反映する場合は、次を使います。

```bash
npm run db:migrate:deploy
```

## SQLite から Postgres へ既存データを移す

すでに `dev.db` などに購入データがある場合は、先に Postgres 側へマイグレーションを適用してから、次のコマンドを実行します。

```bash
npm run db:migrate:deploy
npm run db:migrate:sqlite-to-postgres
```

この移行コマンドは、`SQLITE_MIGRATION_DATABASE_URL` で指定した SQLite DB から `BuyerAccess` と `Purchase` を読み込み、Postgres 側へ `upsert` します。

## Vercel 公開手順

1. Neon で本番用 Postgres を作成します。
2. Vercel にこのリポジトリを接続します。
3. Vercel の Environment Variables に `.env.example` の値を登録します。
4. 初回デプロイ前に `DATABASE_URL` が本番DBを向いていることを確認します。
5. デプロイ後に `npm run db:migrate:deploy` を実行し、スキーマを反映します。
6. Stripe と Resend の本番設定を反映します。

### Vercel で登録する値

- Production:
  - `DATABASE_URL`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_BASE_URL`
  - `RESEND_API_KEY`
  - `PURCHASE_ACCESS_FROM_EMAIL`
- Preview:
  - `DATABASE_URL` (Preview 用DBまたは共有の検証DB)
  - `STRIPE_SECRET_KEY` (Stripe test key)
  - `STRIPE_WEBHOOK_SECRET` (Preview 用 endpoint secret)
  - `NEXT_PUBLIC_BASE_URL` (Preview URL)
  - `RESEND_API_KEY`
  - `PURCHASE_ACCESS_FROM_EMAIL`

`NEXT_PUBLIC_BASE_URL` は各環境の正規URLに合わせてください。購入完了後のリダイレクト、メール本文内リンク、Stripe 商品画像URLに使われます。

## Stripe / Resend 本番設定

- Stripe Webhook の送信先を `https://<your-domain>/api/stripe/webhook` に設定します。
- 購読イベントは `checkout.session.completed` を有効にします。
- 本番公開時は `STRIPE_SECRET_KEY` と `STRIPE_WEBHOOK_SECRET` を live 用に差し替えます。
- Resend では送信元ドメイン認証を済ませ、`PURCHASE_ACCESS_FROM_EMAIL` を実在の送信元にします。

## 購入後リンクの再取得フロー

- Stripe Checkout で購入者メールを取得します。
- `checkout.session.completed` を Webhook で受けて購入履歴を保存します。
- 成功ページから購入者向けリンクをメール送信できます。
- 後日 `/purchase-access` でメールアドレスを入力すると、購入済み教材ページへのリンクを再送できます。

## 動作確認ポイント

- Stripe Checkout が開始できる
- 成功ページに戻れる
- Webhook 経由で `Purchase` が保存される
- `/purchase-access` からメール再送できる
- `/library?token=...` で購入済み教材が表示される
