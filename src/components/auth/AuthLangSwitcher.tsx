"use client";

import { useTransition } from "react";
import { setLocale } from "@/actions/settings.actions";
import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/locales/en";

const LANGS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "pt", label: "PT" },
];

export function AuthLangSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function handleSelect(l: Locale) {
    if (l === locale || isPending) return;
    startTransition(async () => {
      await setLocale(l);
      window.location.reload();
    });
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-1">
      {LANGS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSelect(value)}
          disabled={isPending}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
            locale === value
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
              : "text-fg-subtle hover:text-fg-muted hover:bg-surface2 border border-transparent"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
