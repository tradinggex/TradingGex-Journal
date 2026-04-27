"use client";

import { formatCurrency, formatPercent } from "@/lib/formatters";
import { useTranslation } from "@/lib/i18n/context";

interface SetupStat {
  name: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  avgR: number | null;
}

export function SetupStatsTable({ data }: { data: SetupStat[] }) {
  const t = useTranslation();

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-fg-subtle text-sm font-mono">
        {t("analytics.noSetupData")}
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.netPnl - a.netPnl);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {[
              t("analytics.setupCols.setup"),
              t("analytics.setupCols.trades"),
              t("analytics.setupCols.wins"),
              t("analytics.setupCols.losses"),
              t("analytics.setupCols.winRate"),
              t("analytics.setupCols.netPnl"),
              t("analytics.setupCols.avgR"),
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[10px] text-fg-subtle uppercase tracking-wider font-mono whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const pnlPos = s.netPnl >= 0;
            return (
              <tr
                key={s.name}
                className="border-b border-[var(--border)] hover:bg-surface2 transition-colors"
              >
                <td className="px-4 py-3 text-foreground font-semibold text-xs">{s.name}</td>
                <td className="px-4 py-3 text-fg-muted font-mono text-xs">{s.count}</td>
                <td className="px-4 py-3 text-green-400 font-mono text-xs">{s.wins}</td>
                <td className="px-4 py-3 text-red-400 font-mono text-xs">{s.losses}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface3 rounded-full h-1.5 max-w-20">
                      <div
                        className="h-1.5 rounded-full bg-purple-500"
                        style={{ width: `${s.winRate}%` }}
                      />
                    </div>
                    <span className="text-fg-muted font-mono text-xs">{formatPercent(s.winRate)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono font-bold text-xs ${pnlPos ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(s.netPnl)}
                  </span>
                </td>
                <td className="px-4 py-3 text-fg-muted font-mono text-xs">
                  {s.avgR !== null
                    ? `${s.avgR >= 0 ? "+" : ""}${s.avgR.toFixed(2)}R`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
