"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "@/lib/i18n/context";

interface Instrument {
  id: string;
  symbol: string;
  name: string;
}

interface Setup {
  id: string;
  name: string;
}

interface TradeFiltersProps {
  instruments: Instrument[];
  setups: Setup[];
  currentDirection?: string;
  currentInstrument?: string;
  currentSetup?: string;
  currentStatus?: string;
}

export function TradeFilters({
  instruments,
  setups,
  currentDirection = "",
  currentInstrument = "",
  currentSetup = "",
  currentStatus = "",
}: TradeFiltersProps) {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/trades?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => {
    router.push("/trades");
  };

  const hasFilters = currentDirection || currentInstrument || currentSetup || currentStatus;

  const inputClass =
    "bg-white/5 text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/40 border-0";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Direction chips */}
      <div className="flex gap-1">
        {["", "LONG", "SHORT"].map((dir) => {
          const active = currentDirection === dir;
          const label = dir === "" ? t("trades.filters.allDirections") : dir;
          let chipClass =
            "text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer";
          if (!active) {
            chipClass += " text-slate-400 bg-white/5 hover:text-slate-200 hover:bg-white/8";
          } else if (dir === "LONG") {
            chipClass += " bg-emerald-400/15 text-emerald-400";
          } else if (dir === "SHORT") {
            chipClass += " bg-red-400/15 text-red-400";
          } else {
            chipClass += " bg-purple-500/15 text-purple-400";
          }
          return (
            <button
              key={dir}
              className={chipClass}
              onClick={() => updateFilter("direction", dir)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={inputClass}
      >
        <option value="">{t("trades.filters.allStatuses")}</option>
        <option value="CLOSED">{t("status.CLOSED")}</option>
        <option value="OPEN">{t("status.OPEN")}</option>
        <option value="CANCELLED">{t("status.CANCELLED")}</option>
      </select>

      {/* Instrument filter */}
      <select
        value={currentInstrument}
        onChange={(e) => updateFilter("instrument", e.target.value)}
        className={inputClass}
      >
        <option value="">{t("trades.filters.allInstruments")}</option>
        {instruments.map((ins) => (
          <option key={ins.id} value={ins.id}>
            {ins.symbol}
          </option>
        ))}
      </select>

      {/* Setup filter */}
      <select
        value={currentSetup}
        onChange={(e) => updateFilter("setup", e.target.value)}
        className={inputClass}
      >
        <option value="">{t("trades.filters.allSetups")}</option>
        {setups.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="text-[11px] text-slate-500 hover:text-slate-300 bg-white/4 hover:bg-white/7 px-3 py-1.5 rounded-full transition-all"
        >
          {t("trades.filters.clear")}
        </button>
      )}
    </div>
  );
}
