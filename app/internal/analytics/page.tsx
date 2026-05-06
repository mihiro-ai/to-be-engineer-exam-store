import type { Metadata } from "next";
import {
  getAnalyticsRange,
  getPageViewAnalytics,
} from "@/lib/analytics";
import { AccessAnalyticsDashboardView } from "@/views/analytics/AccessAnalyticsDashboardView";

export const metadata: Metadata = {
  title: "アクセス集計",
  robots: {
    index: false,
    follow: false,
  },
};

type AnalyticsPageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const { from, to } = await searchParams;
  const range = getAnalyticsRange({
    from,
    to,
  });
  const analytics = await getPageViewAnalytics(range);

  return (
    <AccessAnalyticsDashboardView
      analytics={analytics}
      from={range.from}
      to={range.to}
    />
  );
}
