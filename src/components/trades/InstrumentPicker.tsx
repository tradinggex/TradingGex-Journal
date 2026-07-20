"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/context";

export interface PickerInstrument {
  id: string;
  symbol: string;
  name: string;
  market: string;
  tickSize: number;
  tickValue: number;
  exchange?: string | null;
}

type Category = "futures" | "stocks" | "forex" | "options";

const CATEGORIES: { id: Category; label: string; markets: string[] }[] = [
  { id: "futures", label: "Futures", markets: ["CME", "CRYPTO", "GENERIC"] },
  { id: "stocks",  label: "Stocks",  markets: ["STOCKS"] },
  { id: "forex",   label: "Forex",   markets: ["FOREX"] },
  { id: "options", label: "Options", markets: ["OPTIONS"] },
];

function getCategory(market: string): Category {
  if (market === "STOCKS")  return "stocks";
  if (market === "FOREX")   return "forex";
  if (market === "OPTIONS") return "options";
  return "futures";
}

interface Props {
  instruments: PickerInstrument[];
  value: string;
  onChange: (id: string) => void;
  required?: boolean;
}

export function InstrumentPicker({ instruments, value, onChange, required }: Props) {
  const t = useTranslation();
  const selected = instruments.find((i) => i.id === value) ?? null;

  const [open, setOpen] = useState(!selected);
  const [category, setCategory] = useState<Category>(() =>
    selected ? getCategory(selected.market) : "futures"
  );
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c: Record<Category, number> = { futures: 0, stocks: 0, forex: 0, options: 0 };
    instruments.forEach((i) => { c[getCategory(i.market)]++; });
    return c;
  }, [instruments]);

  const filtered = useMemo(() => {
    const catMarkets = CATEGORIES.find((c) => c.id === category)?.markets ?? [];
    if (!search) return instruments.filter((i) => catMarkets.includes(i.market));
    const q = search.toLowerCase();
    return instruments.filter(
      (i) => catMarkets.includes(i.market) &&
        (i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
    );
  }, [instruments, category, search]);

  function selectInstrument(id: string) {
    onChange(id);
    setOpen(false);
    setSearch("");
  }

  function openPicker() {
    if (selected) setCategory(getCategory(selected.market));
    setOpen(true);
  }

  return (
    <div>
      {/* Collapsed: show selected instrument */}
      {selected && !open ? (
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:brightness-110"
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2 text-left min-w-0">
            <span className="font-bold text-foreground font-mono text-xs shrink-0">{selected.symbol}</span>
            <span className="text-fg-muted text-xs truncate">{selected.name}</span>
            <span
              className="text-[9px] font-mono rounded px-1 py-0.5 shrink-0"
              style={{ border: "1px solid var(--border)", color: "var(--fg-subtle)" }}
            >
              {selected.market}
            </span>
          </div>
          <svg className="text-fg-subtle shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
          </svg>
        </button>
      ) : (
        /* Expanded picker */
        <div className="space-y-2">
          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ borderBottom: "1px solid var(--border)" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.id); setSearch(""); }}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  category === cat.id
                    ? "bg-purple-500 text-white"
                    : "text-fg-muted hover:text-foreground"
                }`}
                style={category !== cat.id ? { background: "transparent" } : undefined}
              >
                {cat.label}
                {counts[cat.id] > 0 && (
                  <span className="ml-1 opacity-60 text-[10px]">({counts[cat.id]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="w-full rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none placeholder:text-fg-subtle"
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              placeholder={t("trades.form.searchInstrument")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-foreground"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Instrument list */}
          <div
            className="overflow-y-auto rounded-xl"
            style={{
              maxHeight: "220px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
            }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-fg-subtle">
                {category === "options"
                  ? t("trades.form.noOptionsInstruments")
                  : t("trades.form.noInstrumentsFound")}
              </div>
            ) : (
              filtered.map((ins, idx) => {
                const isSelected = ins.id === value;
                return (
                  <button
                    key={ins.id}
                    type="button"
                    onClick={() => selectInstrument(ins.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:brightness-110 ${
                      isSelected ? "bg-purple-500/10" : ""
                    }`}
                    style={idx > 0 ? { borderTop: "1px solid var(--border)" } : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-xs font-mono text-foreground w-14 shrink-0">{ins.symbol}</span>
                      <span className="text-xs text-fg-muted truncate">{ins.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {ins.exchange && (
                        <span className="text-[9px] text-fg-subtle font-mono">{ins.exchange}</span>
                      )}
                      {isSelected && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-purple-400">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Keep current selection */}
          {selected && open && (
            <button
              type="button"
              onClick={() => { setOpen(false); setSearch(""); }}
              className="text-xs text-fg-muted hover:text-foreground transition-colors"
            >
              ← {t("trades.form.keepCurrent")} {selected.symbol}
            </button>
          )}
        </div>
      )}

      {/* Hidden native input for HTML required validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          readOnly
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </div>
  );
}
