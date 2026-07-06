"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/lib/i18n/context";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export function MentorView({ tradeCount }: { tradeCount: number }) {
  const t = useTranslation();
  const [status, setStatus] = useState<Status>("idle");
  const [analysis, setAnalysis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const canAnalyze = tradeCount >= 5;

  async function startAnalysis() {
    setStatus("loading");
    setAnalysis("");
    setErrorMsg("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/mentor", { signal: controller.signal });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === "not_enough_trades") {
          setErrorMsg(t("mentor.noTrades"));
        } else {
          setErrorMsg(t("mentor.error"));
        }
        setStatus("error");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStatus("error"); return; }

      setStatus("streaming");
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        if (full.includes("\x00ERR\x00")) {
          const errMsg = full.split("\x00ERR\x00")[1] ?? t("mentor.error");
          setErrorMsg(errMsg);
          setStatus("error");
          return;
        }
        setAnalysis(full);
      }

      setStatus("done");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setErrorMsg(t("mentor.error"));
      setStatus("error");
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStatus("done");
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">{t("mentor.title")}</h2>
            <p className="text-sm text-fg-subtle mt-0.5">{t("mentor.subtitle")}</p>
            <p className="text-xs text-fg-muted mt-1">
              {t("mentor.tradeCount").replace("{count}", String(tradeCount))}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status === "streaming" && (
              <button
                type="button"
                onClick={stop}
                className="px-4 py-2 rounded-xl border border-white/10 text-fg-muted hover:text-foreground text-sm transition-colors"
              >
                {t("mentor.stop")}
              </button>
            )}
            {(status === "done" || status === "error") && (
              <button
                type="button"
                onClick={startAnalysis}
                className="px-4 py-2 rounded-xl border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-sm font-medium transition-colors"
              >
                {t("mentor.regenerate")}
              </button>
            )}
            {(status === "idle" || status === "error") && (
              <button
                type="button"
                onClick={startAnalysis}
                disabled={!canAnalyze}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {t("mentor.generate")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Not enough trades */}
      {!canAnalyze && (
        <div className="card p-5 text-sm text-fg-subtle">{t("mentor.noTrades")}</div>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="card p-6 space-y-3">
          <p className="text-sm text-purple-400 animate-pulse">{t("mentor.thinking")}</p>
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className={`h-3 rounded bg-surface2 animate-pulse`} style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Streaming / done */}
      {(status === "streaming" || status === "done") && analysis && (
        <div className="card p-5 sm:p-6">
          <div className="prose prose-sm prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-fg-subtle prose-p:leading-relaxed
            prose-strong:text-foreground
            prose-li:text-fg-subtle
            prose-h2:text-base prose-h3:text-sm
            prose-ul:space-y-1">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          {status === "streaming" && (
            <div className="flex items-center gap-2 mt-4 text-xs text-purple-400">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {t("mentor.generating")}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && errorMsg && (
        <div className="card p-5 text-sm text-red-400">{errorMsg}</div>
      )}

      {/* Disclaimer */}
      {(status === "done" || status === "streaming") && (
        <p className="text-xs text-fg-muted text-center px-4">{t("mentor.disclaimer")}</p>
      )}
    </div>
  );
}
