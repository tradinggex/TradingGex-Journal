"use client";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "purple" | "green" | "red" | "orange";
  icon?: string;
}

const colorMap: Record<string, string> = {
  purple: "text-purple-400",
  green: "text-emerald-400",
  red: "text-red-400",
  orange: "text-orange-400",
};

export function StatCard({ label, value, sub, color = "purple" }: StatCardProps) {
  const textColor = colorMap[color];

  return (
    <div className="card p-5 flex flex-col gap-1">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      <div className={`text-2xl font-bold leading-none mt-2 ${textColor}`}>{value}</div>
      {sub && <div className="text-xs text-fg-subtle mt-1">{sub}</div>}
    </div>
  );
}
