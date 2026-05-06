import {
  getProductAnalyticsCategory,
  getProductBySlug,
  type ProductAnalyticsCategory,
  type ProductSlug,
} from "@/lib/products";

export const PAGE_VIEW_PAGE_KEYS = {
  home: "home",
  productDetail: "product-detail",
} as const;

export type PageViewPageKey =
  (typeof PAGE_VIEW_PAGE_KEYS)[keyof typeof PAGE_VIEW_PAGE_KEYS];

export type PageViewTarget =
  | {
      pageKey: typeof PAGE_VIEW_PAGE_KEYS.home;
      scopeKey: "home";
      pathname: "/";
      productSlug: null;
      productCategory: null;
    }
  | {
      pageKey: typeof PAGE_VIEW_PAGE_KEYS.productDetail;
      scopeKey: ProductSlug;
      pathname: `/products/${ProductSlug}`;
      productSlug: ProductSlug;
      productCategory: ProductAnalyticsCategory;
    };

const PRODUCT_DETAIL_PATHNAME_PATTERN = /^\/products\/([^/]+)\/?$/;

export function normalizeTrackedPathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function resolvePageViewTarget(pathname: string): PageViewTarget | null {
  const normalizedPathname = normalizeTrackedPathname(pathname);

  if (normalizedPathname === "/") {
    return {
      pageKey: PAGE_VIEW_PAGE_KEYS.home,
      scopeKey: "home",
      pathname: "/",
      productSlug: null,
      productCategory: null,
    };
  }

  const productMatch = normalizedPathname.match(PRODUCT_DETAIL_PATHNAME_PATTERN);

  if (!productMatch) {
    return null;
  }

  const product = getProductBySlug(decodeURIComponent(productMatch[1] ?? ""));

  if (!product) {
    return null;
  }

  return {
    pageKey: PAGE_VIEW_PAGE_KEYS.productDetail,
    scopeKey: product.slug,
    pathname: `/products/${product.slug}`,
    productSlug: product.slug,
    productCategory: getProductAnalyticsCategory(product.slug),
  };
}

export function getJstDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("JST 日付キーの生成に失敗しました。");
  }

  return `${year}-${month}-${day}`;
}

export function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getDateKeyRange(from: string, to: string) {
  const range: string[] = [];

  for (let current = from; current <= to; current = addDays(current, 1)) {
    range.push(current);
  }

  return range;
}
