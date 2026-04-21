import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import {
  computeStats,
  buildEquityCurve,
  buildRDistribution,
  buildSetupStats,
  buildMonthlyStats,
} from "@/lib/analytics";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { EquityCurveChart } from "@/components/dashboard/EquityCurveChart";
import { DrawdownChart } from "@/components/analytics/DrawdownChart";
import { RDistributionChart } from "@/components/analytics/RDistributionChart";
import { MonthlyChart } from "@/components/analytics/MonthlyChart";
import { SetupStatsTable } from "@/components/analytics/SetupStatsTable";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const dict = await getDictionary();
  const d = dict.analytics;

  const rawTrades = await prisma.trade.findMany({
    where: { userId: user.userId, status: "CLOSED", netPnl: { not: null } },
    include: { setup: true, instrument: true },
    orderBy: { entryAt: "asc" },
  });

  const trades = rawTrades.map((t) => ({
    ...t,
    netPnl: t.netPnl ?? 0,
    rMultiple: t.rMultiple ?? null,
  }));

  const stats = computeStats(trades);
  const equityCurve = buildEquityCurve(trades);
  const rDist = buildRDistribution(trades);
  const setupStats = buildSetupStats(trades);
  const monthly = buildMonthlyStats(trades);

  const rCount = rDist.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{d.title}</h1>
        <p className="text-sm text-fg-subtle mt-0.5">
          {d.subtitle.replace("{count}", String(stats.totalTrades))}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: d.profitFactor,
            value: stats.profitFactor === 99.99 ? "∞" : stats.profitFactor.toFixed(2),
            sub: d.grossWon.replace("{value}", formatCurrency(stats.grossWins)),
            color: stats.profitFactor >= 1.5 ? "text-emerald-400" : stats.profitFactor >= 1 ? "text-purple-400" : "text-red-400",
          },
          {
            label: d.maxDrawdown,
            value: `-${stats.maxDrawdown.percent.toFixed(1)}%`,
            sub: `${formatCurrency(stats.maxDrawdown.amount)}`,
            color: "text-red-400",
          },
          {
            label: d.sharpe,
            value: stats.sharpeRatio.toFixed(2),
            sub: `${stats.totalTrades} trades`,
            color: stats.sharpeRatio >= 1 ? "text-emerald-400" : stats.sharpeRatio >= 0 ? "text-purple-400" : "text-red-400",
          },
          {
            label: d.avgR,
            value: stats.avgR !== null ? `${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R` : "—",
            sub: d.bestWorst
              .replace("{best}", formatCurrency(stats.bestTrade))
              .replace("{worst}", formatCurrency(stats.worstTrade)),
            color: (stats.avgR ?? 0) >= 0 ? "text-purple-400" : "text-red-400",
          },
        ].map((m, i) => (
          <div key={i} className="card p-5">
            <div className="text-xs font-medium text-fg-muted mb-1">{m.label}</div>
            <div className={`text-2xl font-bold leading-none mt-2 ${m.color}`}>{m.value}</div>
            <div className="text-xs text-fg-subtle mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Detailed Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: d.winRate,
            value: formatPercent(stats.winRate),
            sub: d.wl.replace("{w}", String(stats.winCount)).replace("{l}", String(stats.lossCount)),
            color: stats.winRate >= 50 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: d.avgWin,
            value: formatCurrency(stats.avgWin),
            sub: d.avgLoss.replace("{value}", formatCurrency(stats.avgLoss)),
            color: "text-emerald-400",
          },
          {
            label: d.bestTrade,
            value: formatCurrency(stats.bestTrade),
            sub: d.worstTrade.replace("{value}", formatCurrency(stats.worstTrade)),
            color: "text-slate-100",
          },
          {
            label: d.netPnl,
            value: formatCurrency(stats.netPnl),
            sub: d.closedTrades.replace("{count}", String(stats.totalTrades)),
            color: stats.netPnl >= 0 ? "text-emerald-400" : "text-red-400",
          },
        ].map((m, i) => (
          <div key={i} className="card p-5">
            <div className="text-xs font-medium text-fg-muted mb-1">{m.label}</div>
            <div className={`text-xl font-bold leading-none mt-2 ${m.color}`}>{m.value}</div>
            <div className="text-xs text-fg-subtle mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Equity + Drawdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="card-label">{d.equityCurve}</div>
          <EquityCurveChart data={equityCurve} />
        </div>
        <div className="card p-5">
          <div className="card-label">{d.drawdown}</div>
          <DrawdownChart data={stats.drawdownCurve} />
        </div>
      </div>

      {/* R Distribution + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="card-label">{d.rDist.replace("{count}", String(rCount))}</div>
          <RDistributionChart data={rDist} />
        </div>
        <div className="card p-5">
          <div className="card-label">{d.monthlyPnl}</div>
          <MonthlyChart data={monthly} />
        </div>
      </div>

      {/* Setup Breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="text-sm font-semibold text-foreground">{d.bySetup}</div>
        </div>
        <SetupStatsTable data={setupStats} />
      </div>
    </div>
  );
}
