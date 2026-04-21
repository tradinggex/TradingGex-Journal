"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DrawdownChartProps {
  data: { index: number; drawdown: number; date: string }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { date: string; drawdown: number } }[];
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
        <div className="text-fg-muted font-mono">{d.date}</div>
        <div className="text-red-400 font-mono font-bold">{d.drawdown.toFixed(1)}%</div>
      </div>
    );
  }
  return null;
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-fg-subtle text-sm font-mono">
        Sin datos de drawdown
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff1744" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ff1744" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke="#ff1744"
          strokeWidth={2}
          fill="url(#ddGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#ff1744", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
