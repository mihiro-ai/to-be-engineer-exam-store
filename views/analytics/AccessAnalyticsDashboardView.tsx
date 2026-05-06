import type { PageViewAnalytics } from "@/lib/analytics";

type AccessAnalyticsDashboardViewProps = {
  analytics: PageViewAnalytics;
  from: string;
  to: string;
};

type ChartCardProps = Pick<
  PageViewAnalytics["series"][number],
  "label" | "path" | "accentColor" | "totalViews" | "maxViews" | "points"
>;

const chartWidth = 640;
const chartHeight = 220;
const chartPadding = 24;

function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value);
}

function buildLinePath(values: number[]) {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const maxValue = Math.max(...values, 0);

  return values
    .map((value, index) => {
      const x =
        chartPadding +
        (values.length === 1 ? innerWidth / 2 : (innerWidth * index) / (values.length - 1));
      const y =
        chartPadding +
        innerHeight -
        (maxValue === 0 ? 0 : (value / maxValue) * innerHeight);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[]) {
  const innerWidth = chartWidth - chartPadding * 2;
  const innerHeight = chartHeight - chartPadding * 2;
  const maxValue = Math.max(...values, 0);

  const line = values
    .map((value, index) => {
      const x =
        chartPadding +
        (values.length === 1 ? innerWidth / 2 : (innerWidth * index) / (values.length - 1));
      const y =
        chartPadding +
        innerHeight -
        (maxValue === 0 ? 0 : (value / maxValue) * innerHeight);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return `${line} L ${chartWidth - chartPadding} ${
    chartHeight - chartPadding
  } L ${chartPadding} ${chartHeight - chartPadding} Z`;
}

function ChartCard({
  label,
  path,
  accentColor,
  totalViews,
  maxViews,
  points,
}: ChartCardProps) {
  const values = points.map((point) => point.views);
  const firstDate = points[0]?.date ?? "";
  const lastDate = points.at(-1)?.date ?? "";

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 shadow-[0_12px_40px_rgba(2,6,23,0.16)] backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Daily Trend
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
            {label}
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">{path}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right sm:gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] text-slate-400 sm:text-xs">期間合計</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatNumber(totalViews)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
            <p className="text-[10px] text-slate-400 sm:text-xs">日次最大</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatNumber(maxViews)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/8 bg-slate-950/30 p-3 sm:p-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label={`${label} のアクセス推移グラフ`}
          className="h-auto w-full"
        >
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartPadding + (chartHeight - chartPadding * 2) * ratio;

            return (
              <line
                key={ratio}
                x1={chartPadding}
                y1={y}
                x2={chartWidth - chartPadding}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          <path d={buildAreaPath(values)} fill={accentColor} opacity="0.16" />
          <path
            d={buildLinePath(values)}
            fill="none"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {values.map((value, index) => {
            const innerWidth = chartWidth - chartPadding * 2;
            const innerHeight = chartHeight - chartPadding * 2;
            const maxValue = Math.max(...values, 0);
            const x =
              chartPadding +
              (values.length === 1
                ? innerWidth / 2
                : (innerWidth * index) / (values.length - 1));
            const y =
              chartPadding +
              innerHeight -
              (maxValue === 0 ? 0 : (value / maxValue) * innerHeight);

            return (
              <circle
                key={`${label}-${points[index]?.date ?? index}`}
                cx={x}
                cy={y}
                r="3.5"
                fill={accentColor}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400 sm:text-xs">
          <span>{firstDate}</span>
          <span>{lastDate}</span>
        </div>
      </div>
    </article>
  );
}

export function AccessAnalyticsDashboardView({
  analytics,
  from,
  to,
}: AccessAnalyticsDashboardViewProps) {
  const grandTotal = analytics.totals.reduce(
    (sum, item) => sum + item.totalViews,
    0,
  );

  return (
    <main className="min-h-screen w-full bg-[#19344a]">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/90 sm:text-sm">
                Access Analytics
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                ページ別アクセス集計
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
                トップページ 1 種と商品詳細 4 種の、日ごとのアクセス推移と累計アクセス数を確認できます。
                このページへの導線は公開ページ側には追加していません。
              </p>
            </div>

            <form className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/20 p-4 sm:grid-cols-3 sm:items-end">
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-300">開始日</span>
                <input
                  type="date"
                  name="from"
                  defaultValue={from}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none ring-0"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs font-medium text-slate-300">終了日</span>
                <input
                  type="date"
                  name="to"
                  defaultValue={to}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none ring-0"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                期間を更新
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Range
              </p>
              <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                {analytics.range.from} - {analytics.range.to}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Days
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatNumber(analytics.range.days)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Total Views
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatNumber(grandTotal)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/75 sm:text-sm">
                Total Accesses
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                ページ別トータルアクセス数
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {analytics.totals.map((item, index) => (
              <article
                key={item.key}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-base font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-1 break-all text-xs text-slate-400">{item.path}</p>
                <p className="mt-4 text-3xl font-semibold text-white">
                  {formatNumber(item.totalViews)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100/75 sm:text-sm">
              Daily Charts
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              日ごとのアクセス推移グラフ
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {analytics.series.map((item) => (
              <ChartCard
                key={item.key}
                label={item.label}
                path={item.path}
                accentColor={item.accentColor}
                totalViews={item.totalViews}
                maxViews={item.maxViews}
                points={item.points}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
