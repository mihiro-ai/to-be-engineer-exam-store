import { NextResponse } from "next/server";
import {
  getAnalyticsRange,
  getPageViewAnalytics,
} from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const range = getAnalyticsRange({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });
    const analytics = await getPageViewAnalytics(range);

    return NextResponse.json({
      range: analytics.range,
      series: analytics.series,
      totals: analytics.totals,
      rows: analytics.rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "アクセス集計の取得に失敗しました。";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
