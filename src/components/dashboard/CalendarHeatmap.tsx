"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { useLocale, useTranslation } from "@/lib/i18n/context";

const LOCALE_MAP: Record<string, string> = {
  es: "es-MX",
  en: "en-US",
  pt: "pt-BR",
};

export interface CalendarTrade {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  entryAt: string;
  entryPrice: number;
  exitPrice: number | null;
  netPnl: number;
  rMultiple: number | null;
}

interface CalendarHeatmapProps {
  dailyPnl: Record<string, number>;
  trades?: CalendarTrade[];
}

function getCellStyle(pnl: number | undefined, isToday: boolean): string {
  if (pnl === undefined) {
    return isToday
      ? "bg-purple-500/10 border border-purple-500/40 text-purple-400"
      : "bg-surface2 text-fg-subtle";
  }
  const todayRing = isToday ? " ring-1 ring-purple-500/50" : "";
  return pnl > 0
    ? `bg-emerald-400/15 text-emerald-400 border border-emerald-400/25${todayRing}`
    : `bg-red-400/15 text-red-400 border border-red-400/25${todayRing}`;
}

function DayPanel({
  date,
  pnl,
  trades,
  onClose,
}: {
  date: string;
  pnl: number;
  trades: CalendarTrade[];
  onClose: () => void;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const bcp47 = LOCALE_MAP[locale] ?? "es-MX";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Parse date parts to avoid UTC-shift when constructing label
  const [y, mo, d] = date.split("-").map(Number);
  const dateLabel = new Date(y, mo - 1, d).toLocaleDateString(bcp47, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const wins = trades.filter((t) => t.netPnl > 0).length;
  const losses = trades.filter((t) => t.netPnl < 0).length;
  const isPos = pnl >= 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centered card on sm+ */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dateLabel}
          className={`
            pointer-events-auto
            w-full sm:max-w-md
            bg-surface border border-white/8 shadow-2xl
            rounded-t-2xl sm:rounded-2xl
            transition-all duration-300
            ${visible
              ? "translate-y-0 opacity-100 sm:scale-100"
              : "translate-y-8 opacity-0 sm:scale-95"
            }
          `}
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-4 pb-3">
            <div>
              <p className="text-xs text-fg-subtle capitalize">{dateLabel}</p>
              <p
                className={`text-3xl font-bold mt-1 tabular-nums ${
                  isPos ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPos ? "+" : ""}
                {formatCurrency(pnl)}
              </p>
              {trades.length > 0 && (
                <p className="text-xs text-fg-subtle mt-1">
                  {t("dashboard.calendar.tradeCount", { count: trades.length })}
                  {" · "}
                  <span className="text-emerald-400">{wins}W</span>{" "}
                  <span className="text-red-400">{losses}L</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-muted hover:text-foreground hover:bg-surface2 transition-colors mt-0.5 shrink-0"
              aria-label={t("dashboard.calendar.close")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mx-5" />

          {/* Trade list */}
          <div className="px-5 py-3 space-y-2 max-h-[55vh] sm:max-h-72 overflow-y-auto">
            {trades.length === 0 ? (
              <p className="text-sm text-fg-subtle text-center py-8">
                {t("dashboard.calendar.noTrades")}
              </p>
            ) : (
              trades.map((trade) => {
                const tradePos = trade.netPnl >= 0;
                return (
                  <Link
                    key={trade.id}
                    href={`/trades/${trade.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl bg-surface2 hover:bg-white/5 active:bg-white/8 transition-colors"
                  >
                    {/* Symbol + direction + prices */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {trade.symbol}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            trade.direction === "LONG"
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </div>
                      <p className="text-xs text-fg-subtle font-mono mt-0.5">
                        {trade.entryPrice.toFixed(2)}
                        {" → "}
                        {trade.exitPrice != null
                          ? trade.exitPrice.toFixed(2)
                          : "—"}
                      </p>
                    </div>

                    {/* P&L + R */}
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold font-mono ${
                          tradePos ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {tradePos ? "+" : ""}
                        {formatCurrency(trade.netPnl)}
                      </p>
                      {trade.rMultiple !== null && (
                        <p className="text-[11px] text-fg-subtle font-mono mt-0.5">
                          {trade.rMultiple >= 0 ? "+" : ""}
                          {trade.rMultiple.toFixed(2)}R
                        </p>
                      )}
                    </div>

                    {/* Chevron */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-fg-subtle shrink-0"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })
            )}
          </div>

          {/* Safe-area bottom padding on mobile */}
          <div className="h-4 sm:h-0" />
        </div>
      </div>
    </>
  );
}

export function CalendarHeatmap({ dailyPnl, trades = [] }: CalendarHeatmapProps) {
  const t = useTranslation();
  const locale = useLocale();
  const bcp47 = LOCALE_MAP[locale] ?? "es-MX";

  const weekdays = useMemo(() => {
    // Jan 1, 2023 is a Sunday — iterate Sun→Sat for the header
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2023, 0, 1 + i);
      return new Intl.DateTimeFormat(bcp47, { weekday: "short" }).format(date);
    });
  }, [bcp47]);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const monthLabel = firstDay.toLocaleDateString(bcp47, {
    month: "long",
    year: "numeric",
  });

  // Monthly stats
  let winDays = 0;
  let lossDays = 0;
  let monthPnl = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const pnl = dailyPnl[dateStr];
    if (pnl !== undefined) {
      if (pnl > 0) winDays++;
      else if (pnl < 0) lossDays++;
      monthPnl += pnl;
    }
  }

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Data for the selected day — match by UTC date the same way buildDailyPnl does
  const selectedPnl = selectedDate != null ? dailyPnl[selectedDate] : undefined;
  const selectedTrades = selectedDate != null
    ? trades.filter(
        (t) => new Date(t.entryAt).toISOString().slice(0, 10) === selectedDate
      )
    : [];

  return (
    <div>
      {/* Header: navigation + month label + stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-muted hover:text-foreground hover:bg-surface2 transition-colors"
            aria-label={t("dashboard.calendar.prevMonth")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-base font-bold text-foreground capitalize min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-muted hover:text-foreground hover:bg-surface2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={t("dashboard.calendar.nextMonth")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-400">
            <span className="text-fg-subtle mr-1">{t("dashboard.calendar.winLabel")}</span>
            {winDays}d
          </span>
          <span className="text-red-400">
            <span className="text-fg-subtle mr-1">{t("dashboard.calendar.lossLabel")}</span>
            {lossDays}d
          </span>
          <span className={`font-bold ${monthPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {monthPnl >= 0 ? "+" : ""}
            {formatCurrency(monthPnl)}
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-fg-subtle uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-10 sm:h-14 md:h-16 rounded-lg sm:rounded-xl"
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const pnl = dailyPnl[dateStr];
          const hasTrade = pnl !== undefined;
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          const isSelected = selectedDate === dateStr;

          const cellStyle = getCellStyle(hasTrade ? pnl : undefined, isToday);

          return (
            <button
              key={dateStr}
              type="button"
              onClick={hasTrade ? () => setSelectedDate(dateStr) : undefined}
              disabled={!hasTrade}
              aria-label={
                hasTrade
                  ? `${dateStr}: ${formatCurrency(pnl)}`
                  : dateStr
              }
              className={`
                h-10 sm:h-14 md:h-16 rounded-lg sm:rounded-xl
                flex flex-col items-center justify-center gap-0.5
                transition-all duration-150
                ${hasTrade
                  ? "cursor-pointer hover:scale-[1.06] hover:shadow-md hover:brightness-110 active:scale-95"
                  : "cursor-default"
                }
                ${isSelected ? "ring-2 ring-white/50 scale-[1.06] brightness-110" : ""}
                ${cellStyle}
              `}
            >
              <span
                className={`text-xs sm:text-sm font-bold leading-none ${
                  isToday && !hasTrade ? "text-purple-400" : ""
                }`}
              >
                {day}
              </span>
              {hasTrade && (
                <span className="hidden sm:block text-[10px] sm:text-xs font-mono leading-none font-semibold">
                  {pnl > 0 ? "+" : ""}
                  {Math.abs(pnl) >= 1000
                    ? `${(pnl / 1000).toFixed(1)}k`
                    : Math.round(pnl)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 text-xs text-fg-subtle">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-400/15 border border-emerald-400/25" />
          <span>{t("dashboard.calendar.profit")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-400/15 border border-red-400/25" />
          <span>{t("dashboard.calendar.lossLegend")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/10 border border-purple-500/40" />
          <span>{t("dashboard.calendar.today")}</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate != null && selectedPnl !== undefined && (
        <DayPanel
          date={selectedDate}
          pnl={selectedPnl}
          trades={selectedTrades}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
