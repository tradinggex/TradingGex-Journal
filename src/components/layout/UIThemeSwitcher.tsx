"use client";
import { useEffect, useState } from "react";

type UITheme = "aurora" | "cosmic";

export function UIThemeSwitcher() {
  const [theme, setTheme] = useState<UITheme>("aurora");

  useEffect(() => {
    const stored = localStorage.getItem("ui-theme") as UITheme | null;
    if (stored === "cosmic") setTheme("cosmic");
  }, []);

  function toggle() {
    const next: UITheme = theme === "aurora" ? "cosmic" : "aurora";
    if (next === "cosmic") {
      document.documentElement.classList.add("cosmic");
    } else {
      document.documentElement.classList.remove("cosmic");
    }
    localStorage.setItem("ui-theme", next);
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      title={theme === "aurora" ? "Switch to Cosmic theme" : "Switch to Aurora theme"}
      className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-fg-muted hover:text-foreground border border-[var(--border)] hover:border-[var(--color-fg-subtle)] transition-all"
    >
      {theme === "aurora" ? (
        <>
          <span className="text-sm leading-none">🌌</span>
          <span className="hidden md:inline text-[11px]">Cosmic</span>
        </>
      ) : (
        <>
          <span className="text-sm leading-none">🌠</span>
          <span className="hidden md:inline text-[11px]">Aurora</span>
        </>
      )}
    </button>
  );
}
