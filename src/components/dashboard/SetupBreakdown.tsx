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

interface SetupBreakdownProps {
  data: { name: string; netPnl: number; count: number }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; netPnl: number; count: number } }[];
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const isPos = d.netPnl >= 0;
    return (
      <div className="bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
        <div className="text-foreground font-semibold mb-1">{d.name}</div>
        <div className={`font-mono font-bold ${isPos ? "text-green-400" : "text-red-400"}`}>
          {formatCurrency(d.netPnl)}
        </div>
        <div className="text-fg-subtle font-mono">{d.count} trades</div>
      </div>
    );
  }
  return null;
}

export function SetupBreakdown({ data }: SetupBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-fg-subtle text-sm font-mono">
        Sin datos de setups
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.netPnl - a.netPnl);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="netPnl" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, index) => (
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
