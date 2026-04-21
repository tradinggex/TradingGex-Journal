import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatR, formatDateTime } from "@/lib/formatters";
import { EMOTIONS, MARKETS } from "@/lib/constants";
import { DeleteTradeButton } from "@/components/trades/DeleteTradeButton";
import { ScreenshotGallery } from "@/components/trades/ScreenshotGallery";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TradeDetailPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const dict = await getDictionary();
  const d = dict.trades.detail;

  const trade = await prisma.trade.findFirst({
    where: { id, userId: user.userId },
    include: {
      instrument: true,
      setup: true,
      tags: { include: { tag: true } },
      screenshots: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!trade) notFound();

  const isLong = trade.direction === "LONG";
  const pnlPos = (trade.netPnl ?? 0) >= 0;
  const market = MARKETS.find((m) => m.value === trade.instrument.market);
  const emotion = EMOTIONS.find((e) => e.value === trade.emotion);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/trades" className="text-xs text-fg-subtle hover:text-fg-muted font-mono transition-colors">
              {d.back}
            </Link>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
            {trade.instrument.symbol}
            <span
              className={`text-sm px-3 py-1 rounded-lg font-bold ${
                isLong
                  ? "bg-green-400/15 text-green-400"
                  : "bg-red-400/15 text-red-400"
              }`}
            >
              {trade.direction}
            </span>
          </h1>
          <p className="text-sm text-fg-subtle font-mono mt-0.5">
            {formatDateTime(trade.entryAt)}
            {trade.exitAt && ` → ${formatDateTime(trade.exitAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/trades/${id}/edit`}
            className="border border-[var(--border)] text-fg-muted hover:text-foreground text-xs px-3 py-2 rounded-lg transition-colors font-mono"
          >
            {d.edit}
          </Link>
          <DeleteTradeButton tradeId={id} />
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-[10px] text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.netPnl}</div>
          <div className={`text-2xl font-black font-mono ${pnlPos ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(trade.netPnl ?? 0)}
          </div>
          {trade.grossPnl !== null && (
            <div className="text-xs text-fg-subtle font-mono mt-0.5">
              {d.grossFees
                .replace("{gross}", formatCurrency(trade.grossPnl))
                .replace("{fees}", formatCurrency(trade.fees))}
            </div>
          )}
        </div>
        <div className="card p-4">
          <div className="text-[10px] text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.rMultiple}</div>
          <div className={`text-2xl font-black font-mono ${(trade.rMultiple ?? 0) >= 0 ? "text-purple-500" : "text-red-400"}`}>
            {formatR(trade.rMultiple)}
          </div>
          {trade.plannedR !== null && (
            <div className="text-xs text-fg-subtle font-mono mt-0.5">
              {d.planned.replace("{value}", formatR(trade.plannedR))}
            </div>
          )}
        </div>
        <div className="card p-4">
          <div className="text-[10px] text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.risk}</div>
          <div className="text-2xl font-black font-mono text-orange-400">
            {trade.riskAmount !== null ? formatCurrency(trade.riskAmount) : "—"}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {d.contracts.replace("{count}", String(trade.size))}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.quality}</div>
          <div className="text-2xl font-black text-yellow-400">
            {trade.quality ? "★".repeat(trade.quality) + "☆".repeat(5 - trade.quality) : "—"}
          </div>
          {emotion && (
            <div className="text-xs text-fg-muted font-mono mt-0.5">
              {emotion.emoji} {emotion.label}
            </div>
          )}
        </div>
      </div>

      {/* Trade details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono">{d.details}</div>
          <div className="space-y-2">
            {[
              [d.instrument, `${trade.instrument.symbol} — ${trade.instrument.name}`],
              [d.market,
                <span
                  key="market"
                  className="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                  style={{
                    color: market?.color ?? "#90a4ae",
                    backgroundColor: `${market?.color ?? "#90a4ae"}18`,
                    border: `1px solid ${market?.color ?? "#90a4ae"}30`,
                  }}
                >
                  {trade.instrument.market}
                </span>
              ],
              [d.setup, trade.setup ? (
                <span
                  key="setup"
                  className="text-xs px-2 py-0.5 rounded font-semibold"
                  style={{
                    color: trade.setup.color,
                    backgroundColor: `${trade.setup.color}18`,
                    border: `1px solid ${trade.setup.color}30`,
                  }}
                >
                  {trade.setup.name}
                </span>
              ) : "—"],
              [d.status, trade.status],
              [d.entry, `${trade.entryPrice} @ ${formatDateTime(trade.entryAt)}`],
              [d.exit, trade.exitPrice ? `${trade.exitPrice} @ ${trade.exitAt ? formatDateTime(trade.exitAt) : "—"}` : "—"],
              [d.stopLoss, trade.stopLoss ?? "—"],
              [d.takeProfit, trade.takeProfit ?? "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex items-start justify-between gap-4 text-sm">
                <span className="text-fg-subtle font-mono text-xs shrink-0">{label}</span>
                <span className="text-foreground text-right text-xs">{value}</span>
              </div>
            ))}
          </div>

          {trade.tags.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="text-xs text-fg-subtle font-mono mb-2">{d.tags}</div>
              <div className="flex flex-wrap gap-1.5">
                {trade.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      color: tag.color,
                      backgroundColor: `${tag.color}18`,
                      border: `1px solid ${tag.color}40`,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-3">
          {trade.notes && (
            <div className="card p-5">
              <div className="text-xs text-fg-subtle uppercase tracking-wider font-mono mb-2">{d.notes}</div>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
            </div>
          )}
          {trade.mistakes && (
            <div className="bg-surface rounded-xl p-5 border border-red-400/20">
              <div className="text-xs text-red-400/70 uppercase tracking-wider font-mono mb-2">{d.mistakes}</div>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{trade.mistakes}</p>
            </div>
          )}
          {trade.lessonsLearned && (
            <div className="bg-surface rounded-xl p-5 border border-purple-500/20">
              <div className="text-xs text-purple-500/70 uppercase tracking-wider font-mono mb-2">{d.lessons}</div>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">{trade.lessonsLearned}</p>
            </div>
          )}
        </div>
      </div>

      {/* Screenshots */}
      <ScreenshotGallery tradeId={id} screenshots={trade.screenshots} />
    </div>
  );
}
