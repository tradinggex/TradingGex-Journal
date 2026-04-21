"use client";

import Link from "next/link";
import { formatCurrency, formatR, formatDateTime } from "@/lib/formatters";
import { MARKETS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/context";

interface TradeRow {
  id: string;
  direction: string;
  size: number;
  entryPrice: number;
  exitPrice: number | null;
  netPnl: number | null;
  rMultiple: number | null;
  quality: number | null;
  entryAt: Date | string;
  instrument: { symbol: string; market: string };
  setup: { name: string; color: string } | null;
  tags: { tag: { id: string; name: string; color: string } }[];
  status: string;
}

interface TradeTableProps {
  trades: TradeRow[];
}

function MarketBadge({ market }: { market: string }) {
  const m = MARKETS.find((x) => x.value === market);
  const color = m?.color ?? "#90a4ae";
  return (
    <span
      className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase"
      style={{ color, backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
    >
      {market}
    </span>
  );
}

function Stars({ count }: { count: number | null }) {
  if (!count) return <span className="text-fg-subtle">—</span>;
  return (
    <span className="text-yellow-400 text-xs">
      {"★".repeat(count)}
      <span className="text-slate-700">{"★".repeat(5 - count)}</span>
    </span>
  );
}

export function TradeTable({ trades }: TradeTableProps) {
  const t = useTranslation();

  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="px-6 py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-fg-muted font-semibold mb-1">{t("trades.noTrades")}</div>
          <div className="text-slate-500 text-sm">{t("trades.noTradesHint")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {[
                t("trades.cols.date"),
                t("trades.cols.instrument"),
                t("trades.cols.dir"),
                t("trades.cols.size"),
                t("trades.cols.entry"),
                t("trades.cols.exit"),
                t("trades.cols.pnl"),
                t("trades.cols.r"),
                t("trades.cols.setup"),
                t("trades.cols.quality"),
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[11px] font-medium text-fg-muted uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const isLong = trade.direction === "LONG";
              const pnlVal = trade.netPnl ?? 0;
              const pnlPos = pnlVal >= 0;
              const isClosed = trade.status === "CLOSED";

              return (
                <tr
                  key={trade.id}
                  className="hover:bg-white/2 transition-colors group"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                    {formatDateTime(trade.entryAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-foreground font-bold text-xs">
                        {trade.instrument.symbol}
                      </span>
                      <MarketBadge market={trade.instrument.market} />
                    </div>
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
                  <td className="px-4 py-3 text-foreground font-mono text-xs">
                    {trade.size}
                  </td>
                  <td className="px-4 py-3 text-foreground font-mono text-xs">
                    {trade.entryPrice}
                  </td>
                  <td className="px-4 py-3 text-fg-muted font-mono text-xs">
                    {trade.exitPrice ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isClosed ? (
                      <span
                        className={`font-mono font-semibold text-xs ${
                          pnlPos ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(pnlVal)}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                        {trade.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-fg-muted font-mono text-xs">
                    {formatR(trade.rMultiple)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {trade.setup ? (
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          color: trade.setup.color,
                          backgroundColor: `${trade.setup.color}18`,
                          border: `1px solid ${trade.setup.color}30`,
                        }}
                      >
                        {trade.setup.name}
                      </span>
                    ) : (
                      <span className="text-fg-subtle">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Stars count={trade.quality} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/trades/${trade.id}`}
                        className="text-[10px] text-purple-500 hover:text-purple-400 font-mono border border-purple-500/20 hover:border-purple-500/40 px-2 py-1 rounded transition-colors"
                      >
                        {t("trades.cols.view")}
                      </Link>
                      <Link
                        href={`/trades/${trade.id}/edit`}
                        className="text-[10px] text-slate-400 hover:text-slate-200 font-mono border border-white/10 hover:border-white/20 px-2 py-1 rounded transition-colors"
                      >
                        {t("trades.cols.edit")}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
