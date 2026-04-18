import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL が未設定です。.env または .env.local に Postgres / Neon の接続先を設定してください。",
    );
  }

  if (!/^(postgres(ql)?|prisma\+postgres):\/\//.test(databaseUrl)) {
    throw new Error(
      "DATABASE_URL の形式が不正です。postgresql:// または postgres:// から始まる Postgres / Neon の接続URLを設定してください。",
    );
  }

  return databaseUrl;
}

function createPrismaClient() {
  const databaseUrl = getDatabaseUrl();

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
  });
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
