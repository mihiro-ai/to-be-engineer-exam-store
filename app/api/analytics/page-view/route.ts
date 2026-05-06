import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getJstDateKey, resolvePageViewTarget } from "@/lib/page-views";

export const runtime = "nodejs";

type PageViewRequestBody = {
  pathname?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PageViewRequestBody | null;
  const pathname = body?.pathname?.trim();

  if (!pathname) {
    return NextResponse.json(
      { error: "pathname が必要です。" },
      { status: 400 },
    );
  }

  const target = resolvePageViewTarget(pathname);

  if (!target) {
    return NextResponse.json(
      { error: "集計対象外のパスです。" },
      { status: 400 },
    );
  }

  const dateKey = getJstDateKey();

  await db.dailyPageView.upsert({
    where: {
      dateKey_pageKey_scopeKey: {
        dateKey,
        pageKey: target.pageKey,
        scopeKey: target.scopeKey,
      },
    },
    update: {
      views: {
        increment: 1,
      },
      path: target.pathname,
      productSlug: target.productSlug,
      productCategory: target.productCategory,
    },
    create: {
      dateKey,
      pageKey: target.pageKey,
      scopeKey: target.scopeKey,
      path: target.pathname,
      productSlug: target.productSlug,
      productCategory: target.productCategory,
      views: 1,
    },
  });

  return NextResponse.json({ ok: true });
}
