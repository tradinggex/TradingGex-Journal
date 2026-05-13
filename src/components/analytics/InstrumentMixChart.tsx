"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/lib/i18n/context";
import { formatPercent } from "@/lib/formatters";

interface MarketSlice {
  market: string;
  count: number;
  color: string;
}

interface InstrumentMixChartProps {
  data: MarketSlice[];
}

export function InstrumentMixChart({ data }: InstrumentMixChartProps) {
  const t = useTranslation();
  const total = data.reduce((s, d) => s + d.count, 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-fg-subtle text-sm font-mono">
        {t("analytics.noInstrumentData")}
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, value: d.count }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as MarketSlice & { value: number };
              const pct = total > 0 ? (d.count / total) * 100 : 0;
              const name = t(`markets.${d.market}`) || d.market;
              return (
                <div className="bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
                  <div className="font-bold mb-1" style={{ color: d.color }}>{name}</div>
                  <div className="text-foreground font-mono">
                    {d.count} {t("analytics.tradesLabel")}
                  </div>
                  <div className="text-fg-subtle font-mono">{formatPercent(pct)}</div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-1">
        {data.map((d) => {
          const pct = total > 0 ? (d.count / total) * 100 : 0;
          const name = t(`markets.${d.market}`) || d.market;
          return (
            <div key={d.market} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-fg-muted">{name}</span>
              <span className="text-fg-subtle font-mono tabular-nums">
                {formatPercent(pct)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
