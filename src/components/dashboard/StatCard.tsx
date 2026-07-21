"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "purple" | "green" | "red" | "orange";
}

const colorMap: Record<string, string> = {
  purple: "text-purple-400",
  green:  "text-emerald-400",
  red:    "text-red-400",
  orange: "text-orange-400",
};

const glowMap: Record<string, string> = {
  purple: "card-glow-purple",
  green:  "card-glow-green",
  red:    "card-glow-red",
  orange: "card-glow-orange",
};

export function StatCard({ label, value, sub, color = "purple" }: StatCardProps) {
  return (
    <div className={`card p-5 flex flex-col gap-1 ${glowMap[color]}`}>
      <span className="text-xs font-semibold text-fg-muted tracking-wide">{label}</span>
      <div className={`text-2xl font-bold leading-none mt-2 ${colorMap[color]}`}>{value}</div>
      {sub && <div className="text-xs text-fg-subtle mt-1">{sub}</div>}
    </div>
  );
}
