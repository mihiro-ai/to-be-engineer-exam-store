import { db } from "@/lib/db";
import {
  PRODUCT_ANALYTICS_CATEGORIES,
  PRODUCT_SLUGS,
  type ProductSlug,
} from "@/lib/products";
import {
  addDays,
  getDateKeyRange,
  getJstDateKey,
  isValidDateKey,
  PAGE_VIEW_PAGE_KEYS,
} from "@/lib/page-views";

export const ANALYTICS_SERIES_DEFINITIONS = [
  {
    key: "home",
    label: "トップページ",
    pageKey: PAGE_VIEW_PAGE_KEYS.home,
    scopeKey: "home",
    path: "/",
    productSlug: null,
    productCategory: null,
    accentColor: "#38bdf8",
  },
  {
    key: "full-set",
    label: PRODUCT_ANALYTICS_CATEGORIES["full-set"],
    pageKey: PAGE_VIEW_PAGE_KEYS.productDetail,
    scopeKey: "full-set",
    path: "/products/full-set",
    productSlug: "full-set" as ProductSlug,
    productCategory: PRODUCT_ANALYTICS_CATEGORIES["full-set"],
    accentColor: "#4ade80",
  },
  {
    key: "mechanical",
    label: PRODUCT_ANALYTICS_CATEGORIES.mechanical,
    pageKey: PAGE_VIEW_PAGE_KEYS.productDetail,
    scopeKey: "mechanical",
    path: "/products/mechanical",
    productSlug: "mechanical" as ProductSlug,
    productCategory: PRODUCT_ANALYTICS_CATEGORIES.mechanical,
    accentColor: "#f59e0b",
  },
  {
    key: "electrical",
    label: PRODUCT_ANALYTICS_CATEGORIES.electrical,
    pageKey: PAGE_VIEW_PAGE_KEYS.productDetail,
    scopeKey: "electrical",
    path: "/products/electrical",
    productSlug: "electrical" as ProductSlug,
    productCategory: PRODUCT_ANALYTICS_CATEGORIES.electrical,
    accentColor: "#a78bfa",
  },
  {
    key: "information",
    label: PRODUCT_ANALYTICS_CATEGORIES.information,
    pageKey: PAGE_VIEW_PAGE_KEYS.productDetail,
    scopeKey: "information",
    path: "/products/information",
    productSlug: "information" as ProductSlug,
    productCategory: PRODUCT_ANALYTICS_CATEGORIES.information,
    accentColor: "#f472b6",
  },
] as const;

export type AnalyticsSeriesKey =
  (typeof ANALYTICS_SERIES_DEFINITIONS)[number]["key"];

export type AnalyticsDataPoint = {
  date: string;
  views: number;
};

export type AnalyticsSeries = {
  key: AnalyticsSeriesKey;
  label: string;
  pageKey: string;
  scopeKey: string;
  path: string;
  productSlug: ProductSlug | null;
  productCategory: string | null;
  accentColor: string;
  points: AnalyticsDataPoint[];
  totalViews: number;
  maxViews: number;
};

export type AnalyticsRange = {
  from: string;
  to: string;
  days: string[];
};

export type PageViewAnalytics = {
  range: {
    from: string;
    to: string;
    days: number;
  };
  series: AnalyticsSeries[];
  totals: Array<{
    key: AnalyticsSeriesKey;
    label: string;
    path: string;
    totalViews: number;
  }>;
  rows: Array<{
    dateKey: string;
    pageKey: string;
    scopeKey: string;
    path: string;
    productSlug: string | null;
    productCategory: string | null;
    views: number;
  }>;
};

export function getAnalyticsRange(params: {
  from?: string | null;
  to?: string | null;
}) {
  const today = getJstDateKey();
  const defaultFrom = addDays(today, -29);
  const from = params.from?.trim() || defaultFrom;
  const to = params.to?.trim() || today;

  if (!isValidDateKey(from) || !isValidDateKey(to)) {
    throw new Error("from と to は YYYY-MM-DD 形式で指定してください。");
  }

  if (from > to) {
    throw new Error("from は to 以下の日付を指定してください。");
  }

  const days = getDateKeyRange(from, to);

  if (days.length > 366) {
    throw new Error("取得期間は 366 日以内で指定してください。");
  }

  return {
    from,
    to,
    days,
  } satisfies AnalyticsRange;
}

export async function getPageViewAnalytics(range: AnalyticsRange): Promise<PageViewAnalytics> {
  const rows = await db.dailyPageView.findMany({
    where: {
      dateKey: {
        gte: range.from,
        lte: range.to,
      },
    },
    orderBy: [
      { dateKey: "asc" },
      { pageKey: "asc" },
      { scopeKey: "asc" },
    ],
    select: {
      dateKey: true,
      pageKey: true,
      scopeKey: true,
      path: true,
      productSlug: true,
      productCategory: true,
      views: true,
    },
  });

  const rowMap = new Map(
    rows.map((row) => [`${row.dateKey}:${row.pageKey}:${row.scopeKey}`, row]),
  );

  const series = ANALYTICS_SERIES_DEFINITIONS.map((definition) => {
    const points = range.days.map((dateKey) => ({
      date: dateKey,
      views:
        rowMap.get(`${dateKey}:${definition.pageKey}:${definition.scopeKey}`)
          ?.views ?? 0,
    }));
    const totalViews = points.reduce((sum, point) => sum + point.views, 0);
    const maxViews = points.reduce(
      (max, point) => Math.max(max, point.views),
      0,
    );

    return {
      ...definition,
      points,
      totalViews,
      maxViews,
    };
  });

  return {
    range: {
      from: range.from,
      to: range.to,
      days: range.days.length,
    },
    series,
    totals: series.map((item) => ({
      key: item.key,
      label: item.label,
      path: item.path,
      totalViews: item.totalViews,
    })),
    rows,
  };
}

export function getDefaultAnalyticsSeriesOrder() {
  return ["home", ...PRODUCT_SLUGS] as AnalyticsSeriesKey[];
}
