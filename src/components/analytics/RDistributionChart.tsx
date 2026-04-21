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

interface RDistributionChartProps {
  data: { bucket: string; count: number; wins: number; losses: number }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { bucket: string; count: number; wins: number; losses: number } }[];
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2 text-xs">
        <div className="text-foreground font-bold font-mono mb-1">{d.bucket}</div>
        <div className="text-fg-muted font-mono">{d.count} trades</div>
        <div className="text-green-400 font-mono">{d.wins}W</div>
        <div className="text-red-400 font-mono">{d.losses}L</div>
      </div>
    );
  }
  return null;
}

export function RDistributionChart({ data }: RDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-fg-subtle text-sm font-mono">
        Sin datos de R múltiple
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="bucket"
          tick={{ fill: "#64748b", fontSize: 9, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={25}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => {
            const isPositive = entry.bucket.startsWith("+") || entry.bucket === "0.0R";
            return (
              <Cell
                key={`cell-${index}`}
                fill={isPositive ? "#00e676" : "#ff1744"}
                fillOpacity={0.75}
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
