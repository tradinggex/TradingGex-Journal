"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { useLocale } from "@/lib/i18n/context";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";

interface WeekSummary {
  pnl: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  weekStart: string;
  weekEnd: string;
}

// ISO week key: "weeklyReview_2026_W29"
function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 4); // Jan 4 is always in week 1
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `weeklyReview_${now.getFullYear()}_W${String(Math.max(1, weekNum)).padStart(2, "0")}`;
}

// Show Friday 18:00 ET through Sunday 23:59 ET
function isWeeklyReviewTime(): boolean {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  if (weekday === "Fri" && hour >= 18) return true;
  if (weekday === "Sat" || weekday === "Sun") return true;
  return false;
}

const BOOLEANS: Record<string, string> = { en: "en-US", es: "es-MX", pt: "pt-BR" };

export function WeeklyReviewBanner() {
  const t = useTranslation();
  const locale = useLocale();
  const bcp47 = BOOLEANS[locale] ?? "es-MX";

  const [show, setShow] = useState(false);
  const [data, setData] = useState<WeekSummary | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [settingGoal, setSettingGoal] = useState(false);

  useEffect(() => {
    if (!isWeeklyReviewTime()) return;
    const key = getWeekKey();
    if (localStorage.getItem(`${key}_dismissed`)) return;

    const storedGoal = localStorage.getItem("weeklyPnlGoal");
    if (storedGoal) setGoal(parseFloat(storedGoal));

    fetch("/api/weekly-summary")
      .then((r) => r.json())
      .then((d: WeekSummary) => {
        setData(d);
        setShow(true);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    localStorage.setItem(`${getWeekKey()}_dismissed`, "1");
    setShow(false);
  }

  function saveGoal() {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) {
      localStorage.setItem("weeklyPnlGoal", String(val));
      setGoal(val);
      setGoalInput("");
      setSettingGoal(false);
    }
  }

  if (!show || !data) return null;

  const pnlPositive = data.pnl >= 0;
  const metGoal = goal !== null && data.pnl >= goal;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(bcp47, { month: "short", day: "numeric" });
  const weekLabel = data.weekStart
    ? `${fmt(data.weekStart)} – ${fmt(data.weekEnd)}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--surface)", border: "1px solid rgba(139,92,246,0.25)" }}>

        {/* gradient accent bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg,#7c3aed,#6366f1,#7c3aed)" }} />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                {t("dashboard.weeklyReview.label")}
              </p>
              <h2 className="text-xl font-black text-foreground mt-0.5">{weekLabel}</h2>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg hover:bg-white/8 transition-colors text-fg-muted hover:text-foreground"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Big P&L */}
          <div className={`text-center py-5 rounded-xl ${pnlPositive
            ? "bg-emerald-400/8 border border-emerald-400/20"
            : "bg-red-400/8 border border-red-400/20"}`}>
            <div className={`text-5xl font-black font-mono tracking-tight ${pnlPositive ? "text-emerald-400" : "text-red-400"}`}>
              {data.pnl >= 0 ? "+" : ""}{formatCurrency(data.pnl)}
            </div>
            <div className="text-xs text-fg-subtle mt-1.5">{t("dashboard.weeklyReview.netPnl")}</div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface2)" }}>
              <div className="text-xl font-bold text-foreground">{data.totalTrades}</div>
              <div className="text-[10px] text-fg-subtle mt-0.5">{t("dashboard.weeklyReview.trades")}</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface2)" }}>
              <div className={`text-xl font-bold ${data.winRate >= 50 ? "text-emerald-400" : "text-red-400"}`}>
                {data.totalTrades > 0 ? `${data.winRate.toFixed(0)}%` : "—"}
              </div>
              <div className="text-[10px] text-fg-subtle mt-0.5">{t("dashboard.weeklyReview.winRate")}</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--surface2)" }}>
              <div className="text-sm font-bold mt-1">
                <span className="text-emerald-400">{data.wins}W</span>
                <span className="text-fg-subtle mx-1">/</span>
                <span className="text-red-400">{data.losses}L</span>
              </div>
              <div className="text-[10px] text-fg-subtle mt-0.5">{t("dashboard.weeklyReview.wl")}</div>
            </div>
          </div>

          {/* Goal section */}
          {goal !== null && !settingGoal ? (
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${
              metGoal
                ? "bg-emerald-400/8 border-emerald-400/20"
                : "bg-amber-400/8 border-amber-400/20"
            }`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 ${
                metGoal ? "bg-emerald-400/20 text-emerald-400" : "bg-amber-400/20 text-amber-400"
              }`}>
                {metGoal ? "✓" : "○"}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${metGoal ? "text-emerald-400" : "text-amber-400"}`}>
                  {metGoal ? t("dashboard.weeklyReview.goalReached") : t("dashboard.weeklyReview.goalPending")}
                </div>
                <div className="text-xs text-fg-subtle truncate">
                  {t("dashboard.weeklyReview.goalProgress")
                    .replace("{goal}", formatCurrency(goal))
                    .replace("{remaining}", metGoal ? "✓" : formatCurrency(goal - data.pnl))}
                </div>
              </div>
              <button
                onClick={() => { setGoalInput(String(goal)); setSettingGoal(true); }}
                className="text-[10px] text-fg-muted hover:text-foreground transition-colors shrink-0"
              >
                {t("common.edit")}
              </button>
            </div>
          ) : settingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t("settings.goals.pnlGoalPlaceholder")}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveGoal(); } }}
                autoFocus
                className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none placeholder:text-fg-subtle"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <button
                onClick={saveGoal}
                className="bg-purple-500 text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-purple-400 transition-colors"
              >
                {t("dashboard.weeklyReview.saveGoal")}
              </button>
              <button
                onClick={() => setSettingGoal(false)}
                className="text-fg-muted text-sm px-2 py-2 rounded-lg hover:bg-white/8 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSettingGoal(true)}
              className="w-full text-sm text-fg-muted py-2.5 rounded-xl transition-all hover:text-purple-400"
              style={{ border: "1px dashed var(--border)" }}
            >
              + {t("dashboard.weeklyReview.setGoal")}
            </button>
          )}

          {/* Journal CTA */}
          <div className="space-y-2">
            <p className="text-sm text-fg-muted text-center">
              {data.totalTrades > 0
                ? t("dashboard.weeklyReview.documentInsights")
                : t("dashboard.weeklyReview.noTrades")}
            </p>
            <div className="flex gap-2">
              <Link
                href="/journal/new"
                onClick={dismiss}
                className="flex-1 bg-purple-500 text-white text-sm font-bold py-2.5 rounded-xl text-center hover:bg-purple-400 transition-colors"
              >
                {t("dashboard.weeklyReview.writeReview")}
              </Link>
              <button
                onClick={dismiss}
                className="text-sm text-fg-muted px-4 py-2.5 rounded-xl hover:bg-white/8 transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                {t("dashboard.weeklyReview.later")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
