"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EMOTIONS } from "@/lib/constants";
import { createTrade, updateTrade } from "@/actions/trade.actions";
import { useTranslation } from "@/lib/i18n/context";

interface Instrument {
  id: string;
  symbol: string;
  name: string;
  market: string;
  tickSize: number;
  tickValue: number;
}

interface Setup {
  id: string;
  name: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TradeFormProps {
  instruments: Instrument[];
  setups: Setup[];
  tags: Tag[];
  editTrade?: {
    id: string;
    instrumentId: string;
    setupId: string | null;
    direction: string;
    size: number;
    status: string;
    entryPrice: number;
    exitPrice: number | null;
    stopLoss: number | null;
    takeProfit: number | null;
    entryAt: Date | string;
    exitAt: Date | string | null;
    grossPnl: number | null;
    fees: number;
    netPnl: number | null;
    riskAmount: number | null;
    rMultiple: number | null;
    plannedR: number | null;
    quality: number | null;
    emotion: string | null;
    notes: string | null;
    mistakes: string | null;
    lessonsLearned: string | null;
    tags: { tag: { id: string } }[];
  };
}

const inputCls =
  "bg-surface2 border border-[var(--border)] text-foreground rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:outline-none w-full placeholder:text-fg-subtle";
const labelCls = "text-xs text-fg-subtle mb-1 block";

function toDatetimeLocal(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TradeForm({ instruments, setups, tags, editTrade }: TradeFormProps) {
  const t = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editTrade;

  const initialTagIds = editTrade?.tags.map((t) => t.tag.id) ?? [];

  const [form, setForm] = useState({
    instrumentId: editTrade?.instrumentId ?? "",
    setupId: editTrade?.setupId ?? "",
    direction: editTrade?.direction ?? "LONG",
    size: editTrade ? String(editTrade.size) : "",
    status: editTrade?.status ?? "CLOSED",
    entryPrice: editTrade ? String(editTrade.entryPrice) : "",
    exitPrice: editTrade?.exitPrice != null ? String(editTrade.exitPrice) : "",
    stopLoss: editTrade?.stopLoss != null ? String(editTrade.stopLoss) : "",
    takeProfit: editTrade?.takeProfit != null ? String(editTrade.takeProfit) : "",
    entryAt: toDatetimeLocal(editTrade?.entryAt),
    exitAt: toDatetimeLocal(editTrade?.exitAt),
    grossPnl: editTrade?.grossPnl != null ? String(editTrade.grossPnl) : "",
    fees: editTrade ? String(editTrade.fees) : "0",
    netPnl: editTrade?.netPnl != null ? String(editTrade.netPnl) : "",
    riskAmount: editTrade?.riskAmount != null ? String(editTrade.riskAmount) : "",
    rMultiple: editTrade?.rMultiple != null ? String(editTrade.rMultiple) : "",
    plannedR: editTrade?.plannedR != null ? String(editTrade.plannedR) : "",
    quality: editTrade?.quality != null ? String(editTrade.quality) : "",
    emotion: editTrade?.emotion ?? "",
    notes: editTrade?.notes ?? "",
    mistakes: editTrade?.mistakes ?? "",
    lessonsLearned: editTrade?.lessonsLearned ?? "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTagIds);
  const [autoCalc, setAutoCalc] = useState(true);

  const selectedInstrument = instruments.find((i) => i.id === form.instrumentId);

  useEffect(() => {
    if (!autoCalc) return;
    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const size = parseFloat(form.size);
    const sl = parseFloat(form.stopLoss);
    const fees = parseFloat(form.fees) || 0;
    const inst = selectedInstrument;

    if (inst && !isNaN(entry) && !isNaN(exit) && !isNaN(size)) {
      const ticks = Math.abs(exit - entry) / inst.tickSize;
      const direction = form.direction === "LONG" ? 1 : -1;
      const dirTicks = direction * (exit - entry) / inst.tickSize;
      const gross = dirTicks * inst.tickValue * size;
      const net = gross - fees;

      setForm((f) => ({
        ...f,
        grossPnl: isNaN(gross) ? f.grossPnl : gross.toFixed(2),
        netPnl: isNaN(net) ? f.netPnl : net.toFixed(2),
      }));

      if (!isNaN(sl) && sl !== entry) {
        const riskTicks = Math.abs(entry - sl) / inst.tickSize;
        const riskAmt = riskTicks * inst.tickValue * size;
        const rMult = (gross - fees) / riskAmt;
        setForm((f) => ({
          ...f,
          riskAmount: riskAmt.toFixed(2),
          rMultiple: rMult.toFixed(2),
        }));
      }
      void ticks;
    }
  }, [form.entryPrice, form.exitPrice, form.size, form.stopLoss, form.fees, form.direction, selectedInstrument, autoCalc]);

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      instrumentId: form.instrumentId,
      setupId: form.setupId || null,
      direction: form.direction,
      size: parseFloat(form.size),
      status: form.status,
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : null,
      takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      entryAt: form.entryAt,
      exitAt: form.exitAt || null,
      grossPnl: form.grossPnl ? parseFloat(form.grossPnl) : null,
      fees: parseFloat(form.fees) || 0,
      netPnl: form.netPnl ? parseFloat(form.netPnl) : null,
      riskAmount: form.riskAmount ? parseFloat(form.riskAmount) : null,
      rMultiple: form.rMultiple ? parseFloat(form.rMultiple) : null,
      plannedR: form.plannedR ? parseFloat(form.plannedR) : null,
      quality: form.quality ? parseInt(form.quality) : null,
      emotion: form.emotion || null,
      notes: form.notes || null,
      mistakes: form.mistakes || null,
      lessonsLearned: form.lessonsLearned || null,
      tagIds: selectedTags,
    };

    startTransition(async () => {
      const res = isEditing
        ? await updateTrade(editTrade!.id, data)
        : await createTrade(data);
      if ("error" in res) {
        toast.error(t("trades.toasts.saveError"));
      } else {
        toast.success(isEditing ? t("trades.toasts.updated") : t("trades.toasts.registered"));
        router.push(isEditing ? `/trades/${editTrade!.id}` : "/trades");
      }
    });
  }

  const sectionTitle = "text-xs text-fg-subtle uppercase tracking-wider font-mono mb-4 flex items-center gap-2 after:flex-1 after:h-px after:bg-surface3";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-4xl">
      {/* ── Instrument & Direction ── */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("trades.form.instrumentDir")}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t("trades.form.instrument")}</label>
            <select
              className={inputCls}
              value={form.instrumentId}
              onChange={(e) => setForm((f) => ({ ...f, instrumentId: e.target.value }))}
              required
            >
              <option value="">{t("trades.form.selectInstrument")}</option>
              {instruments.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.symbol} — {ins.name}
                </option>
              ))}
            </select>
            {selectedInstrument && (
              <div className="text-[10px] text-fg-subtle font-mono mt-1">
                {t("trades.form.tickInfo", {
                  size: selectedInstrument.tickSize,
                  value: selectedInstrument.tickValue,
                })}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>{t("trades.form.direction")}</label>
            <div className="flex gap-2">
              {["LONG", "SHORT"].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, direction: dir }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    form.direction === dir
                      ? dir === "LONG"
                        ? "bg-green-400/15 text-green-400 border-green-400/40"
                        : "bg-red-400/15 text-red-400 border-red-400/40"
                      : "border-[var(--border)] text-fg-subtle"
                  }`}
                >
                  {dir === "LONG" ? t("trades.form.long") : t("trades.form.short")}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>{t("trades.form.status")}</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="CLOSED">{t("status.CLOSED")}</option>
              <option value="OPEN">{t("status.OPEN")}</option>
              <option value="CANCELLED">{t("status.CANCELLED")}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>{t("trades.form.setup")}</label>
            <select
              className={inputCls}
              value={form.setupId}
              onChange={(e) => setForm((f) => ({ ...f, setupId: e.target.value }))}
            >
              <option value="">{t("trades.form.noSetup")}</option>
              {setups.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>{t("trades.form.size")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="1"
              value={form.size}
              onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={labelCls}>{t("trades.form.entryDate")}</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.entryAt}
              onChange={(e) => setForm((f) => ({ ...f, entryAt: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={labelCls}>{t("trades.form.exitDate")}</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={form.exitAt}
              onChange={(e) => setForm((f) => ({ ...f, exitAt: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* ── Prices ── */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("trades.form.prices")}</div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>{t("trades.form.entryPrice")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="5050.25"
              value={form.entryPrice}
              onChange={(e) => setForm((f) => ({ ...f, entryPrice: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.exitPrice")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="5075.50"
              value={form.exitPrice}
              onChange={(e) => setForm((f) => ({ ...f, exitPrice: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.stopLoss")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="5040.00"
              value={form.stopLoss}
              onChange={(e) => setForm((f) => ({ ...f, stopLoss: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.takeProfit")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="5100.00"
              value={form.takeProfit}
              onChange={(e) => setForm((f) => ({ ...f, takeProfit: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* ── PnL & Risk ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className={sectionTitle + " flex-1"}>{t("trades.form.pnlRisk")}</div>
          <label className="flex items-center gap-2 text-xs text-fg-subtle cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={autoCalc}
              onChange={(e) => setAutoCalc(e.target.checked)}
              className="accent-purple-500"
            />
            {t("trades.form.autoCalc")}
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>{t("trades.form.grossPnl")}</label>
            <input
              type="number"
              step="any"
              className={`${inputCls} ${autoCalc ? "opacity-60" : ""}`}
              placeholder="0.00"
              value={form.grossPnl}
              onChange={(e) => setForm((f) => ({ ...f, grossPnl: e.target.value }))}
              readOnly={autoCalc}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.fees")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="0.00"
              value={form.fees}
              onChange={(e) => setForm((f) => ({ ...f, fees: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.netPnl")}</label>
            <input
              type="number"
              step="any"
              className={`${inputCls} ${autoCalc ? "opacity-60" : ""} ${
                form.netPnl
                  ? parseFloat(form.netPnl) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                  : ""
              }`}
              placeholder="0.00"
              value={form.netPnl}
              onChange={(e) => setForm((f) => ({ ...f, netPnl: e.target.value }))}
              readOnly={autoCalc}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.riskAmount")}</label>
            <input
              type="number"
              step="any"
              className={`${inputCls} ${autoCalc ? "opacity-60" : ""}`}
              placeholder="0.00"
              value={form.riskAmount}
              onChange={(e) => setForm((f) => ({ ...f, riskAmount: e.target.value }))}
              readOnly={autoCalc}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.realizedR")}</label>
            <input
              type="number"
              step="any"
              className={`${inputCls} ${autoCalc ? "opacity-60" : ""} ${
                form.rMultiple
                  ? parseFloat(form.rMultiple) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                  : ""
              }`}
              placeholder="0.00"
              value={form.rMultiple}
              onChange={(e) => setForm((f) => ({ ...f, rMultiple: e.target.value }))}
              readOnly={autoCalc}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.plannedR")}</label>
            <input
              type="number"
              step="any"
              className={inputCls}
              placeholder="2.0"
              value={form.plannedR}
              onChange={(e) => setForm((f) => ({ ...f, plannedR: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* ── Psychology & Review ── */}
      <div className="card p-5 space-y-4">
        <div className={sectionTitle}>{t("trades.form.psychology")}</div>

        <div>
          <label className={labelCls}>{t("trades.form.emotion")}</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {EMOTIONS.map((em) => (
              <button
                key={em.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, emotion: f.emotion === em.value ? "" : em.value }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                  form.emotion === em.value
                    ? "bg-purple-500/15 text-purple-400 border-purple-500/40"
                    : "border-[var(--border)] text-fg-subtle hover:text-fg-muted"
                }`}
              >
                <span>{em.emoji}</span>
                <span>{em.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>{t("trades.form.quality")}</label>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm((f) => ({ ...f, quality: f.quality === String(star) ? "" : String(star) }))}
                className={`text-2xl transition-all ${
                  parseInt(form.quality) >= star ? "text-yellow-400" : "text-fg-subtle/40 hover:text-fg-subtle"
                }`}
              >
                ★
              </button>
            ))}
            {form.quality && (
              <span className="text-xs text-fg-subtle ml-2 font-mono">
                {t("trades.form.qualityLabel", { q: form.quality })}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>{t("trades.form.notes")}</label>
            <textarea
              className={`${inputCls} h-24 resize-none`}
              placeholder={t("trades.form.notesPlaceholder")}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.mistakes")}</label>
            <textarea
              className={`${inputCls} h-24 resize-none`}
              placeholder={t("trades.form.mistakesPlaceholder")}
              value={form.mistakes}
              onChange={(e) => setForm((f) => ({ ...f, mistakes: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("trades.form.lessons")}</label>
            <textarea
              className={`${inputCls} h-24 resize-none`}
              placeholder={t("trades.form.lessonsPlaceholder")}
              value={form.lessonsLearned}
              onChange={(e) => setForm((f) => ({ ...f, lessonsLearned: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* ── Tags ── */}
      {tags.length > 0 && (
        <div className="card p-5">
          <div className={sectionTitle}>{t("trades.form.tags")}</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  selectedTags.includes(tag.id)
                    ? "opacity-100 shadow-sm"
                    : "opacity-40 hover:opacity-70"
                }`}
                style={{
                  color: tag.color,
                  backgroundColor: selectedTags.includes(tag.id) ? `${tag.color}20` : "transparent",
                  borderColor: `${tag.color}50`,
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-4 pb-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-purple-500 hover:bg-purple-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {isPending
            ? t("trades.form.saving")
            : isEditing
            ? t("trades.form.update")
            : t("trades.form.submit")}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-[var(--border)] text-fg-muted hover:text-foreground text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          {t("trades.form.cancel")}
        </button>
      </div>
    </form>
  );
}
