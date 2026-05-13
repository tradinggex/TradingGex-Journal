"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MARKETS } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/context";
import { setLocale } from "@/actions/settings.actions";
import type { Locale } from "@/lib/i18n/locales/en";
import {
  createInstrument,
  updateInstrument,
  deleteInstrument,
  toggleInstrument,
  createSetup,
  updateSetup,
  deleteSetup,
  createTag,
  deleteTag,
} from "@/actions/settings.actions";
import { X as XIcon, Mail, Bug, Lightbulb, Copy, Check } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Instrument {
  id: string;
  symbol: string;
  name: string;
  market: string;
  tickSize: number;
  tickValue: number;
  currency: string;
  exchange: string | null;
  contractSize: number;
  isActive: boolean;
}

interface Setup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface SettingsTabsProps {
  instruments: Instrument[];
  setups: Setup[];
  tags: Tag[];
}

// ── Shared styles ─────────────────────────────────────────────────────────
const inputCls =
  "bg-surface2 border border-[var(--border)] text-foreground rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none w-full placeholder:text-fg-subtle";
const btnPrimary =
  "bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50";
const btnSecondary =
  "border border-[var(--border)] text-fg-muted hover:text-foreground text-xs px-3 py-1.5 rounded-lg transition-colors";
const btnDanger =
  "text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition-colors hover:bg-red-400/10";

// ── Instruments Tab ────────────────────────────────────────────────────────
function InstrumentsTab({ instruments }: { instruments: Instrument[] }) {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Instrument | null>(null);
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    market: "CME",
    tickSize: "",
    tickValue: "",
    currency: "USD",
    exchange: "",
    contractSize: "1",
  });

  function resetForm() {
    setForm({ symbol: "", name: "", market: "CME", tickSize: "", tickValue: "", currency: "USD", exchange: "", contractSize: "1" });
    setShowForm(false);
    setEditing(null);
  }

  function startEdit(ins: Instrument) {
    setEditing(ins);
    setForm({
      symbol: ins.symbol,
      name: ins.name,
      market: ins.market,
      tickSize: String(ins.tickSize),
      tickValue: String(ins.tickValue),
      currency: ins.currency,
      exchange: ins.exchange ?? "",
      contractSize: String(ins.contractSize),
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      symbol: form.symbol,
      name: form.name,
      market: form.market,
      tickSize: parseFloat(form.tickSize),
      tickValue: parseFloat(form.tickValue),
      currency: form.currency,
      exchange: form.exchange || null,
      contractSize: parseFloat(form.contractSize),
      isActive: true,
    };
    startTransition(async () => {
      const res = editing
        ? await updateInstrument(editing.id, data)
        : await createInstrument(data);
      if ("error" in res) {
        toast.error(t("settings.instruments.saveError"));
      } else {
        toast.success(editing ? t("settings.instruments.updated") : t("settings.instruments.created"));
        resetForm();
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleInstrument(id, !current);
      toast.success(!current ? t("settings.instruments.activated") : t("settings.instruments.deactivated"));
    });
  }

  function handleDelete(id: string, symbol: string) {
    if (!confirm(t("settings.instruments.deleteConfirm", { symbol }))) return;
    startTransition(async () => {
      await deleteInstrument(id);
      toast.success(t("settings.instruments.deleted"));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-subtle font-mono">{t("settings.instruments.count", { count: instruments.length })}</span>
        <button className={btnPrimary} onClick={() => { resetForm(); setShowForm(true); }}>
          {t("settings.instruments.add")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface2 border border-[var(--border)] rounded-xl p-5 space-y-4"
        >
          <div className="text-sm font-semibold text-foreground">
            {editing ? t("settings.instruments.editTitle") : t("settings.instruments.newTitle")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.symbol")}</label>
              <input
                className={inputCls}
                placeholder="MES"
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.name")}</label>
              <input
                className={inputCls}
                placeholder="Micro E-mini S&P 500"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.market")}</label>
              <select
                className={inputCls}
                value={form.market}
                onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))}
              >
                {MARKETS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.exchange")}</label>
              <input
                className={inputCls}
                placeholder="CME"
                value={form.exchange}
                onChange={(e) => setForm((f) => ({ ...f, exchange: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.tickSize")}</label>
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder="0.25"
                value={form.tickSize}
                onChange={(e) => setForm((f) => ({ ...f, tickSize: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.tickValue")}</label>
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder="1.25"
                value={form.tickValue}
                onChange={(e) => setForm((f) => ({ ...f, tickValue: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.currency")}</label>
              <input
                className={inputCls}
                placeholder="USD"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.instruments.contractSize")}</label>
              <input
                className={inputCls}
                type="number"
                step="any"
                placeholder="1"
                value={form.contractSize}
                onChange={(e) => setForm((f) => ({ ...f, contractSize: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className={btnPrimary} disabled={isPending}>
              {isPending ? t("settings.instruments.saving") : editing ? t("common.update") : t("common.create")}
            </button>
            <button type="button" className={btnSecondary} onClick={resetForm}>
              {t("settings.instruments.cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {[
                t("settings.instruments.cols.symbol"),
                t("settings.instruments.cols.name"),
                t("settings.instruments.cols.market"),
                t("settings.instruments.cols.exchange"),
                t("settings.instruments.cols.tickSize"),
                t("settings.instruments.cols.tickVal"),
                t("settings.instruments.cols.status"),
                "",
              ].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[10px] text-fg-subtle uppercase tracking-wider font-mono whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instruments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-fg-subtle text-sm font-mono">
                  {t("settings.instruments.noData")}
                </td>
              </tr>
            ) : (
              instruments.map((ins) => {
                const market = MARKETS.find((m) => m.value === ins.market);
                return (
                  <tr key={ins.id} className="border-b border-[var(--border)] hover:bg-surface2 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground font-mono text-xs">{ins.symbol}</td>
                    <td className="px-4 py-3 text-fg-muted text-xs">{ins.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                        style={{
                          color: market?.color ?? "#90a4ae",
                          backgroundColor: `${market?.color ?? "#90a4ae"}18`,
                          border: `1px solid ${market?.color ?? "#90a4ae"}30`,
                        }}
                      >
                        {ins.market}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fg-subtle font-mono text-xs">{ins.exchange ?? "—"}</td>
                    <td className="px-4 py-3 text-fg-muted font-mono text-xs">{ins.tickSize}</td>
                    <td className="px-4 py-3 text-fg-muted font-mono text-xs">${ins.tickValue}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(ins.id, ins.isActive)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border transition-all ${
                          ins.isActive
                            ? "bg-green-400/10 text-green-400 border-green-400/20 hover:bg-green-400/20"
                            : "bg-surface2 text-fg-subtle border-[var(--border)] hover:bg-surface3"
                        }`}
                      >
                        {ins.isActive ? t("settings.instruments.active") : t("settings.instruments.inactive")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className={btnSecondary} onClick={() => startEdit(ins)}>{t("common.edit")}</button>
                        <button className={btnDanger} onClick={() => handleDelete(ins.id, ins.symbol)}><XIcon size={12} strokeWidth={2.5} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Setups Tab ─────────────────────────────────────────────────────────────
function SetupsTab({ setups }: { setups: Setup[] }) {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Setup | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });

  function resetForm() {
    setForm({ name: "", description: "", color: "#6366f1" });
    setShowForm(false);
    setEditing(null);
  }

  function startEdit(s: Setup) {
    setEditing(s);
    setForm({ name: s.name, description: s.description ?? "", color: s.color });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = { name: form.name, description: form.description || null, color: form.color, isActive: true };
      const res = editing
        ? await updateSetup(editing.id, data)
        : await createSetup(data);
      if ("error" in res) {
        toast.error(t("settings.setups.saveError"));
      } else {
        toast.success(editing ? t("settings.setups.updated") : t("settings.setups.created"));
        resetForm();
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(t("settings.setups.deleteConfirm", { name }))) return;
    startTransition(async () => {
      await deleteSetup(id);
      toast.success(t("settings.setups.deleted"));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-subtle font-mono">{t("settings.setups.count", { count: setups.length })}</span>
        <button className={btnPrimary} onClick={() => { resetForm(); setShowForm(true); }}>
          {t("settings.setups.add")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface2 border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="text-sm font-semibold text-foreground">
            {editing ? t("settings.setups.editTitle") : t("settings.setups.newTitle")}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.setups.name")}</label>
              <input
                className={inputCls}
                placeholder="Breakout"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.setups.color")}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  className={inputCls}
                  placeholder="#6366f1"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-fg-subtle mb-1 block">{t("settings.setups.description")}</label>
              <input
                className={inputCls}
                placeholder="..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className={btnPrimary} disabled={isPending}>
              {isPending ? t("settings.setups.saving") : editing ? t("common.update") : t("common.create")}
            </button>
            <button type="button" className={btnSecondary} onClick={resetForm}>
              {t("settings.setups.cancel")}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {setups.length === 0 ? (
          <div className="col-span-3 card px-6 py-12 text-center text-fg-subtle font-mono text-sm">
            {t("settings.setups.noData")}
          </div>
        ) : (
          setups.map((s) => (
            <div
              key={s.id}
              className="card p-4 flex items-start justify-between gap-3"
              style={{ borderLeft: `3px solid ${s.color}` }}
            >
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">{s.name}</div>
                {s.description && (
                  <div className="text-xs text-fg-subtle mt-0.5 leading-snug line-clamp-2">{s.description}</div>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button className={btnSecondary} onClick={() => startEdit(s)}>{t("common.edit")}</button>
                <button className={btnDanger} onClick={() => handleDelete(s.id, s.name)}><XIcon size={12} strokeWidth={2.5} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tags Tab ───────────────────────────────────────────────────────────────
function TagsTab({ tags }: { tags: Tag[] }) {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ name: "", color: "#6366f1" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    startTransition(async () => {
      const res = await createTag(form.name.trim(), form.color);
      if ("error" in res) {
        toast.error(t("settings.tags.createError"));
      } else {
        toast.success(t("settings.tags.created"));
        setForm({ name: "", color: "#6366f1" });
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(t("settings.tags.deleteConfirm", { name }))) return;
    startTransition(async () => {
      await deleteTag(id);
      toast.success(t("settings.tags.deleted"));
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 bg-surface2 border border-[var(--border)] rounded-xl p-4"
      >
        <div className="flex-1">
          <label className="text-xs text-slate-500 mb-1 block">{t("settings.tags.newLabel")}</label>
          <input
            className={inputCls}
            placeholder="FOMO, Revenge, Mistake..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">{t("settings.tags.color")}</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="w-10 h-[38px] rounded cursor-pointer bg-transparent border-0"
          />
        </div>
        <button type="submit" className={btnPrimary} disabled={isPending}>
          {isPending ? "..." : t("settings.tags.add")}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <div className="text-sm text-fg-subtle font-mono py-4">{t("settings.tags.noData")}</div>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold"
              style={{
                color: tag.color,
                backgroundColor: `${tag.color}18`,
                border: `1px solid ${tag.color}40`,
              }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleDelete(tag.id, tag.name)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/20 transition-colors"
              >
                <XIcon size={10} strokeWidth={2.5} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Language Tab ───────────────────────────────────────────────────────────
const LOCALES: { value: Locale; flag: string }[] = [
  { value: "en", flag: "🇺🇸" },
  { value: "es", flag: "🇪🇸" },
  { value: "pt", flag: "🇧🇷" },
];

function LanguageTab() {
  const t = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Locale | null>(null);

  function handleSelect(locale: Locale) {
    setSelected(locale);
    startTransition(async () => {
      await setLocale(locale);
      window.location.reload();
    });
  }

  const labelKey: Record<Locale, string> = {
    en: "settings.language.en",
    es: "settings.language.es",
    pt: "settings.language.pt",
  };

  return (
    <div className="space-y-6 max-w-sm">
      <div>
        <p className="text-sm text-fg-muted">{t("settings.language.description")}</p>
      </div>
      <div className="flex flex-col gap-3">
        {LOCALES.map(({ value, flag }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            disabled={isPending}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left disabled:opacity-50 ${
              selected === value
                ? "border-purple-500/60 bg-purple-500/10 text-purple-400"
                : "border-[var(--border)] bg-surface text-fg-muted hover:text-foreground"
            }`}
          >
            <span className="text-xl">{flag}</span>
            <span>{t(labelKey[value])}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Support Tab ────────────────────────────────────────────────────────────
const SUPPORT_EMAIL = "tradinggex@gmail.com";

function SupportTab() {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function mailto(subject: string) {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* Contact */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
            <Mail size={15} className="text-purple-400" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{t("settings.support.contactTitle")}</div>
            <div className="text-xs text-fg-subtle mt-0.5">{t("settings.support.contactDesc")}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface2 border border-[var(--border)] rounded-lg px-3 py-2">
          <span className="text-xs text-fg-subtle shrink-0">{t("settings.support.emailLabel")}:</span>
          <span className="text-sm font-mono text-foreground flex-1 select-all">{SUPPORT_EMAIL}</span>
          <button
            onClick={copyEmail}
            className="flex items-center gap-1.5 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors shrink-0"
          >
            {copied ? (
              <><Check size={12} strokeWidth={2.5} />{t("settings.support.emailCopied")}</>
            ) : (
              <><Copy size={12} strokeWidth={2} />{t("settings.support.emailCopy")}</>
            )}
          </button>
        </div>
      </div>

      {/* Bug report */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/12 flex items-center justify-center shrink-0">
            <Bug size={15} className="text-red-400" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{t("settings.support.bugsTitle")}</div>
            <div className="text-xs text-fg-subtle mt-0.5">{t("settings.support.bugsDesc")}</div>
          </div>
        </div>
        <button
          onClick={() => mailto("Bug report — TradingGex Journal")}
          className="text-xs font-semibold px-4 py-2 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/8 transition-colors"
        >
          {t("settings.support.bugsButton")}
        </button>
      </div>

      {/* Feature suggestion */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/12 flex items-center justify-center shrink-0">
            <Lightbulb size={15} className="text-amber-400" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{t("settings.support.featureTitle")}</div>
            <div className="text-xs text-fg-subtle mt-0.5">{t("settings.support.featureDesc")}</div>
          </div>
        </div>
        <button
          onClick={() => mailto("Feature suggestion — TradingGex Journal")}
          className="text-xs font-semibold px-4 py-2 rounded-lg border border-amber-500/25 text-amber-400 hover:bg-amber-500/8 transition-colors"
        >
          {t("settings.support.featureButton")}
        </button>
      </div>
    </div>
  );
}

// ── Main SettingsTabs ──────────────────────────────────────────────────────
type TabId = "instruments" | "setups" | "tags" | "language" | "support";

export function SettingsTabs({ instruments, setups, tags }: SettingsTabsProps) {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("instruments");

  const TABS: { id: TabId; label: string }[] = [
    { id: "instruments", label: t("settings.tabs.instruments") },
    { id: "setups", label: t("settings.tabs.setups") },
    { id: "tags", label: t("settings.tabs.tags") },
    { id: "language", label: t("settings.tabs.language") },
    { id: "support", label: t("settings.tabs.support") },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="overflow-x-auto pb-0.5">
      <div className="flex items-center gap-1 bg-surface border border-[var(--border)] rounded-xl p-1 w-fit min-w-full sm:min-w-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-surface2 text-foreground shadow"
                : "text-fg-subtle hover:text-fg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      </div>

      {/* Tab Content */}
      {activeTab === "instruments" && <InstrumentsTab instruments={instruments} />}
      {activeTab === "setups" && <SetupsTab setups={setups} />}
      {activeTab === "tags" && <TagsTab tags={tags} />}
      {activeTab === "language" && <LanguageTab />}
      {activeTab === "support" && <SupportTab />}
    </div>
  );
}
