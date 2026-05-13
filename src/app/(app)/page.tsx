import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary, getLocale } from "@/lib/i18n";
import {
  computeStats,
  buildEquityCurve,
  buildDailyPnl,
  buildSetupStats,
} from "@/lib/analytics";
import { formatCurrency, formatPercent, formatDateTime } from "@/lib/formatters";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurveChart } from "@/components/dashboard/EquityCurveChart";
import { CalendarHeatmap, type CalendarTrade } from "@/components/dashboard/CalendarHeatmap";
import { SetupBreakdown } from "@/components/dashboard/SetupBreakdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const d = dict.dashboard;

  const [{ data: rawTrades }, { data: last10Raw }] = await Promise.all([
    supabase
      .from("Trade")
      .select("*, instrument:Instrument(*), setup:Setup(*)")
      .eq("userId", user.userId)
      .eq("status", "CLOSED")
      .not("netPnl", "is", null)
      .order("entryAt", { ascending: true }),
    supabase
      .from("Trade")
      .select("*, instrument:Instrument(*), setup:Setup(*)")
      .eq("userId", user.userId)
      .eq("status", "CLOSED")
      .order("entryAt", { ascending: false })
      .limit(10),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trades = (rawTrades ?? []).map((t: any) => ({
    ...t,
    netPnl: t.netPnl ?? 0,
    rMultiple: t.rMultiple ?? null,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const last10 = last10Raw ?? [] as any[];

  const stats = computeStats(trades, locale);
  const equityCurve = buildEquityCurve(trades, locale);
  const dailyPnl = buildDailyPnl(trades);
  const setupStats = buildSetupStats(trades);

  const calendarTrades: CalendarTrade[] = trades.map((t: any) => ({
    id: t.id,
    symbol: t.instrument?.symbol ?? "—",
    direction: t.direction,
    entryAt: t.entryAt,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice ?? null,
    netPnl: t.netPnl,
    rMultiple: t.rMultiple ?? null,
  }));

  const netPnlColor = stats.netPnl >= 0 ? "green" : "red";
  const profitFactorColor =
    stats.profitFactor >= 1.5 ? "green" : stats.profitFactor >= 1 ? "purple" : "red";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{d.title}</h1>
        <p className="text-sm text-fg-subtle mt-0.5">
          {d.subtitle.replace("{count}", String(stats.totalTrades))}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={d.netPnl}
          value={formatCurrency(stats.netPnl)}
          sub={d.wl.replace("{w}", String(stats.winCount)).replace("{l}", String(stats.lossCount))}
          color={netPnlColor}
        />
        <StatCard
          label={d.winRate}
          value={formatPercent(stats.winRate)}
          sub={`${stats.totalTrades} ${d.trades}`}
          color={stats.winRate >= 50 ? "green" : "red"}
        />
        <StatCard
          label={d.profitFactor}
          value={stats.profitFactor === 99.99 ? "∞" : stats.profitFactor.toFixed(2)}
          sub={d.avgWin.replace("{value}", formatCurrency(stats.avgWin))}
          color={profitFactorColor}
        />
        <StatCard
          label={d.trades}
          value={String(stats.totalTrades)}
          sub={stats.avgR !== null
            ? d.avgR.replace("{value}", `${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R`)
            : d.avgRNone}
          color="purple"
        />
      </div>

      {/* Equity Curve */}
      <div className="card p-5">
        <div className="card-label">{d.equityCurve}</div>
        <EquityCurveChart data={equityCurve} />
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <div className="card-label mb-1">{d.monthlyCalendar}</div>
        <CalendarHeatmap dailyPnl={dailyPnl} trades={calendarTrades} />
      </div>

      {/* Last 10 Trades + Setup Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-sm font-semibold text-foreground">{d.lastTrades}</span>
            <Link
              href="/trades"
              className="text-xs text-purple-500 hover:text-purple-400 transition-colors"
            >
              {d.viewAll}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  {[d.cols.date, d.cols.instrument, d.cols.dir, d.cols.pnl, d.cols.r, d.cols.setup].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-medium text-fg-muted uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {last10.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-fg-subtle text-sm">
                      {d.noTrades}
                    </td>
                  </tr>
                ) : (
                  last10.map((trade) => {
                    const isLong = trade.direction === "LONG";
                    const pnlVal = trade.netPnl ?? 0;
                    const pnlPos = pnlVal >= 0;
                    return (
                      <tr
                        key={trade.id}
                        className="hover:bg-white/2 transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      >
                        <td className="px-4 py-3 text-fg-muted font-mono text-xs">
                          {formatDateTime(trade.entryAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-foreground font-semibold text-xs">
                            {trade.instrument.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isLong
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {trade.direction}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono font-semibold text-xs ${
                              pnlPos ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {formatCurrency(pnlVal)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-fg-muted font-mono text-xs">
                          {trade.rMultiple !== null
                            ? `${trade.rMultiple >= 0 ? "+" : ""}${trade.rMultiple.toFixed(2)}R`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-fg-muted text-xs">
                          {trade.setup?.name ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-5">
          <div className="card-label">{d.pnlBySetup}</div>
          <SetupBreakdown
            data={setupStats.map((s) => ({
              name: s.name,
              netPnl: s.netPnl,
              count: s.count,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
