"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface MonthlyChartProps {
  data: { month: string; netPnl: number; count: number; wins: number }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { month: string; netPnl: number; count: number; wins: number } }[];
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const isPos = d.netPnl >= 0;
    return (
      <div className="bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
        <div className="text-foreground font-bold font-mono mb-1">{d.month}</div>
        <div className={`font-mono font-bold ${isPos ? "text-green-400" : "text-red-400"}`}>
          {formatCurrency(d.netPnl)}
        </div>
        <div className="text-fg-subtle font-mono">{d.count} trades</div>
        <div className="text-fg-subtle font-mono">
          {d.wins}W / {d.count - d.wins}L
        </div>
      </div>
    );
  }
  return null;
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-fg-subtle text-sm font-mono">
        Sin datos mensuales
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="netPnl" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.netPnl >= 0 ? "#00e676" : "#ff1744"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
