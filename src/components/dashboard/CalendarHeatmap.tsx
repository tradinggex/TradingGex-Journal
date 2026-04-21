"use client";

import { formatCurrency } from "@/lib/formatters";

interface CalendarHeatmapProps {
  dailyPnl: Record<string, number>;
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

export function CalendarHeatmap({ dailyPnl }: CalendarHeatmapProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const monthLabel = firstDay.toLocaleDateString("es-MX", {
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

  return (
    <div>
      {/* Header: month label + stats */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-foreground capitalize">
          {monthLabel}
        </span>
        <div className="flex items-center gap-5 text-sm">
          <span className="text-emerald-400">
            <span className="text-fg-subtle mr-1">win</span>
            {winDays}d
          </span>
          <span className="text-red-400">
            <span className="text-fg-subtle mr-1">loss</span>
            {lossDays}d
          </span>
          <span className={`font-bold ${monthPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {monthPnl >= 0 ? "+" : ""}
            {formatCurrency(monthPnl)}
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-fg-subtle uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-16 rounded-xl" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const pnl = dailyPnl[dateStr];
          const hasTrade = pnl !== undefined;
          const isToday =
            now.getDate() === day &&
            now.getMonth() === month &&
            now.getFullYear() === year;

          const cellStyle = getCellStyle(hasTrade ? pnl : undefined, isToday);

          return (
            <div
              key={dateStr}
              title={hasTrade ? `${dateStr}: ${formatCurrency(pnl)}` : dateStr}
              className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1 cursor-default transition-opacity hover:opacity-75 ${cellStyle}`}
            >
              <span
                className={`text-sm font-bold leading-none ${isToday && !hasTrade ? "text-purple-400" : ""}`}
              >
                {day}
              </span>
              {hasTrade && (
                <span className="text-xs font-mono leading-none font-semibold">
                  {pnl > 0 ? "+" : ""}
                  {Math.abs(pnl) >= 1000
                    ? `${(pnl / 1000).toFixed(1)}k`
                    : Math.round(pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-5 text-xs text-fg-subtle">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-400/15 border border-emerald-400/25" />
          <span>Ganancia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-400/15 border border-red-400/25" />
          <span>Pérdida</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-purple-500/10 border border-purple-500/40" />
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
