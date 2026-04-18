import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient as PostgresPrismaClient } from "@prisma/client";
import { PrismaClient as SqlitePrismaClient } from "./lib/generated/prisma/sqlite-migration/index.js";

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} が未設定です。`);
  }

  return value;
}

async function main() {
  const postgresUrl = getRequiredEnv("DATABASE_URL");
  const sqliteUrl = getRequiredEnv("SQLITE_MIGRATION_DATABASE_URL");

  if (!/^(postgres(ql)?|prisma\+postgres):\/\//.test(postgresUrl)) {
    throw new Error(
      "DATABASE_URL には Postgres / Neon の接続URLを設定してください。",
    );
  }

  if (!sqliteUrl.startsWith("file:")) {
    throw new Error(
      "SQLITE_MIGRATION_DATABASE_URL には file: から始まる SQLite の接続URLを設定してください。",
    );
  }

  const sourceDb = new SqlitePrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: sqliteUrl,
    }),
  });
  const targetDb = new PostgresPrismaClient({
    adapter: new PrismaPg(postgresUrl),
  });

  try {
    const [buyerAccesses, purchases] = await Promise.all([
      sourceDb.buyerAccess.findMany({
        orderBy: {
          createdAt: "asc",
        },
      }),
      sourceDb.purchase.findMany({
        orderBy: {
          paidAt: "asc",
        },
      }),
    ]);

    console.info(
      `SQLite から BuyerAccess=${buyerAccesses.length}件, Purchase=${purchases.length}件 を読み込みました。`,
    );

    await targetDb.$transaction(async (tx) => {
      for (const buyerAccess of buyerAccesses) {
        await tx.buyerAccess.upsert({
          where: {
            email: buyerAccess.email,
          },
          update: {
            accessTokenHash: buyerAccess.accessTokenHash,
            tokenIssuedAt: buyerAccess.tokenIssuedAt,
            createdAt: buyerAccess.createdAt,
            updatedAt: buyerAccess.updatedAt,
          },
          create: {
            id: buyerAccess.id,
            email: buyerAccess.email,
            accessTokenHash: buyerAccess.accessTokenHash,
            tokenIssuedAt: buyerAccess.tokenIssuedAt,
            createdAt: buyerAccess.createdAt,
            updatedAt: buyerAccess.updatedAt,
          },
        });
      }

      for (const purchase of purchases) {
        await tx.purchase.upsert({
          where: {
            stripeSessionId: purchase.stripeSessionId,
          },
          update: {
            stripePaymentIntent: purchase.stripePaymentIntent,
            stripeCustomerId: purchase.stripeCustomerId,
            customerEmail: purchase.customerEmail,
            productSlug: purchase.productSlug,
            productName: purchase.productName,
            paymentStatus: purchase.paymentStatus,
            amountTotal: purchase.amountTotal,
            currency: purchase.currency,
            paidAt: purchase.paidAt,
            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt,
            buyerAccessId: purchase.buyerAccessId,
          },
          create: {
            id: purchase.id,
            stripeSessionId: purchase.stripeSessionId,
            stripePaymentIntent: purchase.stripePaymentIntent,
            stripeCustomerId: purchase.stripeCustomerId,
            customerEmail: purchase.customerEmail,
            productSlug: purchase.productSlug,
            productName: purchase.productName,
            paymentStatus: purchase.paymentStatus,
            amountTotal: purchase.amountTotal,
            currency: purchase.currency,
            paidAt: purchase.paidAt,
            createdAt: purchase.createdAt,
            updatedAt: purchase.updatedAt,
            buyerAccessId: purchase.buyerAccessId,
          },
        });
      }
    });

    console.info("SQLite から Postgres へのデータ移行が完了しました。");
  } finally {
    await Promise.allSettled([sourceDb.$disconnect(), targetDb.$disconnect()]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
