"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { X as XIcon } from "lucide-react";
import {
  createFundedAccount,
  updateFundedAccount,
  deleteFundedAccount,
} from "@/actions/settings.actions";

interface FundedAccount {
  id: string;
  accountType: string;
  firmName: string;
  accountSize: number;
  profitTarget: number | null;
  profitTargetType: string;
  maxDailyDrawdown: number | null;
  maxDailyDrawdownType: string;
  maxTotalDrawdown: number | null;
  maxTotalDrawdownType: string;
  currentBalance: number | null;
  status: string;
  notes: string | null;
}

const inputCls =
  "bg-surface2 border border-[var(--border)] text-foreground rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none w-full placeholder:text-fg-subtle";
const btnPrimary =
  "bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50";
const btnSecondary =
  "border border-[var(--border)] text-fg-muted hover:text-foreground text-xs px-3 py-1.5 rounded-lg transition-colors";
const btnDanger =
  "text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition-colors hover:bg-red-400/10";

const PROP_FIRMS = [
  "FTMO", "Topstep", "MyFundedFutures", "Apex Trader Funding",
  "The 5%ers", "Earn2Trade", "E8 Funding", "TradeDay",
  "Take Profit Trader", "BluSky Trading", "Funding Pips",
  "True Forex Funds", "Alpha Capital Group", "Other",
];

const ACCOUNT_STATUSES = ["active", "evaluation", "passed", "failed"] as const;

export function AccountsView({ accounts }: { accounts: FundedAccount[] }) {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FundedAccount | null>(null);
  const [form, setForm] = useState({
    accountType: "funded",
    firmName: "",
    accountSize: "",
    profitTarget: "",
    profitTargetType: "pct",
    maxDailyDrawdown: "",
    maxDailyDrawdownType: "pct",
    maxTotalDrawdown: "",
    maxTotalDrawdownType: "pct",
    currentBalance: "",
    status: "active",
    notes: "",
  });

  function resetForm() {
    setForm({ accountType: "funded", firmName: "", accountSize: "", profitTarget: "", profitTargetType: "pct", maxDailyDrawdown: "", maxDailyDrawdownType: "pct", maxTotalDrawdown: "", maxTotalDrawdownType: "pct", currentBalance: "", status: "active", notes: "" });
    setShowForm(false);
    setEditing(null);
  }

  function startEdit(a: FundedAccount) {
    setEditing(a);
    setForm({
      accountType: a.accountType,
      firmName: a.firmName,
      accountSize: String(a.accountSize),
      profitTarget: a.profitTarget != null ? String(a.profitTarget) : "",
      profitTargetType: a.profitTargetType ?? "pct",
      maxDailyDrawdown: a.maxDailyDrawdown != null ? String(a.maxDailyDrawdown) : "",
      maxDailyDrawdownType: a.maxDailyDrawdownType ?? "pct",
      maxTotalDrawdown: a.maxTotalDrawdown != null ? String(a.maxTotalDrawdown) : "",
      maxTotalDrawdownType: a.maxTotalDrawdownType ?? "pct",
      currentBalance: a.currentBalance != null ? String(a.currentBalance) : "",
      status: a.status,
      notes: a.notes ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      accountType: form.accountType,
      firmName: form.firmName,
      accountSize: parseFloat(form.accountSize),
      profitTarget: form.profitTarget ? parseFloat(form.profitTarget) : null,
      profitTargetType: form.profitTargetType,
      maxDailyDrawdown: form.maxDailyDrawdown ? parseFloat(form.maxDailyDrawdown) : null,
      maxDailyDrawdownType: form.maxDailyDrawdownType,
      maxTotalDrawdown: form.maxTotalDrawdown ? parseFloat(form.maxTotalDrawdown) : null,
      maxTotalDrawdownType: form.maxTotalDrawdownType,
      currentBalance: form.currentBalance ? parseFloat(form.currentBalance) : null,
      status: form.status,
      notes: form.notes || null,
    };
    startTransition(async () => {
      const res = editing
        ? await updateFundedAccount(editing.id, data)
        : await createFundedAccount(data);
      if ("error" in res) {
        toast.error(t("settings.accounts.saveError"));
      } else {
        toast.success(editing ? t("settings.accounts.updated") : t("settings.accounts.created"));
        resetForm();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t("settings.accounts.deleteConfirm"))) return;
    startTransition(async () => {
      await deleteFundedAccount(id);
      toast.success(t("settings.accounts.deleted"));
    });
  }

  const statusColors: Record<string, string> = {
    active:     "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    evaluation: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    passed:     "bg-purple-400/10 text-purple-400 border-purple-400/20",
    failed:     "bg-red-400/10 text-red-400 border-red-400/20",
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      active: t("settings.accounts.statusActive"),
      evaluation: t("settings.accounts.statusEvaluation"),
      passed: t("settings.accounts.statusPassed"),
      failed: t("settings.accounts.statusFailed"),
    };
    return map[s] ?? s;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-fg-subtle">{t("settings.accounts.subtitle")}</p>
        <button className={btnPrimary} onClick={() => { resetForm(); setShowForm(true); }}>
          {t("settings.accounts.add")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface2 border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-foreground">
            {editing ? t("settings.accounts.editTitle") : t("settings.accounts.newTitle")}
          </div>

          {/* Account type toggle */}
          <div className="flex gap-2">
            {(["personal", "funded"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, accountType: type }))}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  form.accountType === type
                    ? "border-purple-500/60 bg-purple-500/10 text-purple-400"
                    : "border-[var(--border)] text-fg-muted hover:text-foreground"
                }`}
              >
                {type === "personal" ? t("settings.accounts.personal") : t("settings.accounts.funded")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Firm name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.firmName")}</label>
              {form.accountType === "funded" ? (
                <select
                  className={inputCls}
                  value={PROP_FIRMS.includes(form.firmName) ? form.firmName : "Other"}
                  onChange={(e) => {
                    if (e.target.value !== "Other") setForm((f) => ({ ...f, firmName: e.target.value }));
                    else setForm((f) => ({ ...f, firmName: "" }));
                  }}
                >
                  <option value="">Select firm...</option>
                  {PROP_FIRMS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              ) : (
                <input
                  className={inputCls}
                  placeholder={t("settings.accounts.firmNamePlaceholder")}
                  value={form.firmName}
                  onChange={(e) => setForm((f) => ({ ...f, firmName: e.target.value }))}
                  required
                />
              )}
              {form.accountType === "funded" && (!PROP_FIRMS.includes(form.firmName) || form.firmName === "") && (
                <input
                  className={`${inputCls} mt-2`}
                  placeholder="Custom firm name..."
                  value={form.firmName}
                  onChange={(e) => setForm((f) => ({ ...f, firmName: e.target.value }))}
                  required
                />
              )}
            </div>

            {/* Status */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.status")}</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {ACCOUNT_STATUSES.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Account size */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.accountSize")}</label>
              <input className={inputCls} type="number" step="any" placeholder="50000" value={form.accountSize}
                onChange={(e) => setForm((f) => ({ ...f, accountSize: e.target.value }))} required />
            </div>

            {/* Current balance */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.currentBalance")}</label>
              <input className={inputCls} type="number" step="any" placeholder="51200" value={form.currentBalance}
                onChange={(e) => setForm((f) => ({ ...f, currentBalance: e.target.value }))} />
            </div>

            {/* Profit target */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.profitTarget")}</label>
              <div className="flex gap-1.5">
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
                  {(["pct", "usd"] as const).map((type) => (
                    <button key={type} type="button"
                      onClick={() => setForm((f) => ({ ...f, profitTargetType: type }))}
                      className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${form.profitTargetType === type ? "bg-purple-500 text-white" : "text-fg-muted hover:text-foreground"}`}>
                      {type === "pct" ? "%" : "$"}
                    </button>
                  ))}
                </div>
                <input className={inputCls} type="number" step="any"
                  placeholder={form.profitTargetType === "pct" ? "10" : "5000"}
                  value={form.profitTarget}
                  onChange={(e) => setForm((f) => ({ ...f, profitTarget: e.target.value }))} />
              </div>
            </div>

            {/* Max daily drawdown */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.maxDailyDrawdown")}</label>
              <div className="flex gap-1.5">
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
                  {(["pct", "usd"] as const).map((type) => (
                    <button key={type} type="button"
                      onClick={() => setForm((f) => ({ ...f, maxDailyDrawdownType: type }))}
                      className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${form.maxDailyDrawdownType === type ? "bg-purple-500 text-white" : "text-fg-muted hover:text-foreground"}`}>
                      {type === "pct" ? "%" : "$"}
                    </button>
                  ))}
                </div>
                <input className={inputCls} type="number" step="any"
                  placeholder={form.maxDailyDrawdownType === "pct" ? "5" : "2500"}
                  value={form.maxDailyDrawdown}
                  onChange={(e) => setForm((f) => ({ ...f, maxDailyDrawdown: e.target.value }))} />
              </div>
            </div>

            {/* Max total drawdown */}
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.maxTotalDrawdown")}</label>
              <div className="flex gap-1.5">
                <div className="flex rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
                  {(["pct", "usd"] as const).map((type) => (
                    <button key={type} type="button"
                      onClick={() => setForm((f) => ({ ...f, maxTotalDrawdownType: type }))}
                      className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${form.maxTotalDrawdownType === type ? "bg-purple-500 text-white" : "text-fg-muted hover:text-foreground"}`}>
                      {type === "pct" ? "%" : "$"}
                    </button>
                  ))}
                </div>
                <input className={inputCls} type="number" step="any"
                  placeholder={form.maxTotalDrawdownType === "pct" ? "10" : "5000"}
                  value={form.maxTotalDrawdown}
                  onChange={(e) => setForm((f) => ({ ...f, maxTotalDrawdown: e.target.value }))} />
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.accounts.notes")}</label>
              <input className={inputCls} placeholder={t("settings.accounts.notesPlaceholder")} value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className={btnPrimary} disabled={isPending}>
              {isPending ? t("settings.accounts.saving") : editing ? t("common.update") : t("common.create")}
            </button>
            <button type="button" className={btnSecondary} onClick={resetForm}>
              {t("settings.accounts.cancel")}
            </button>
          </div>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="card px-6 py-12 text-center text-fg-subtle font-mono text-sm">
          {t("settings.accounts.noData")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((a) => {
            const progress = a.currentBalance && a.accountSize
              ? ((a.currentBalance - a.accountSize) / a.accountSize) * 100
              : null;
            return (
              <div key={a.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-foreground text-sm">{a.firmName}</div>
                    <div className="text-xs text-fg-subtle mt-0.5">
                      {a.accountType === "personal" ? t("settings.accounts.personal") : t("settings.accounts.funded")}
                      {" · "}${a.accountSize.toLocaleString()}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[a.status] ?? ""}`}>
                    {statusLabel(a.status)}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  {a.profitTarget != null && (
                    <div className="bg-surface2 rounded-lg px-2 py-1.5">
                      <div className="text-[10px] text-fg-muted">Target</div>
                      <div className="text-xs font-bold text-emerald-400">
                        {a.profitTargetType === "usd" ? `$${a.profitTarget.toLocaleString()}` : `${a.profitTarget}%`}
                      </div>
                    </div>
                  )}
                  {a.maxDailyDrawdown != null && (
                    <div className="bg-surface2 rounded-lg px-2 py-1.5">
                      <div className="text-[10px] text-fg-muted">Daily DD</div>
                      <div className="text-xs font-bold text-red-400">
                        {a.maxDailyDrawdownType === "usd" ? `$${a.maxDailyDrawdown.toLocaleString()}` : `${a.maxDailyDrawdown}%`}
                      </div>
                    </div>
                  )}
                  {a.maxTotalDrawdown != null && (
                    <div className="bg-surface2 rounded-lg px-2 py-1.5">
                      <div className="text-[10px] text-fg-muted">Max DD</div>
                      <div className="text-xs font-bold text-red-400">
                        {a.maxTotalDrawdownType === "usd" ? `$${a.maxTotalDrawdown.toLocaleString()}` : `${a.maxTotalDrawdown}%`}
                      </div>
                    </div>
                  )}
                </div>

                {/* P&L progress */}
                {a.currentBalance != null && (
                  <div>
                    <div className="flex justify-between text-[10px] text-fg-muted mb-1">
                      <span>Balance: ${a.currentBalance.toLocaleString()}</span>
                      {progress != null && (
                        <span className={progress >= 0 ? "text-emerald-400" : "text-red-400"}>
                          {progress >= 0 ? "+" : ""}{progress.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    {a.profitTarget != null && progress != null && (
                      <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progress >= 0 ? "bg-emerald-400" : "bg-red-400"}`}
                          style={{ width: `${Math.min(Math.abs(progress) / a.profitTarget * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {a.notes && <p className="text-[11px] text-fg-muted leading-snug">{a.notes}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <button className={btnSecondary} onClick={() => startEdit(a)}>{t("common.edit")}</button>
                  <button className={btnDanger} onClick={() => handleDelete(a.id)}><XIcon size={12} strokeWidth={2.5} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
