"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/lib/i18n/context";
import { Sparkles } from "lucide-react";

interface MentorViewProps {
  tradeCount: number;
}

export function MentorView({ tradeCount }: MentorViewProps) {
  const t = useTranslation();
  const [analysis, setAnalysis] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const MIN_TRADES = 5;

  async function generate() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnalysis("");
    setErrorMsg("");
    setStatus("loading");

    try {
      const res = await fetch("/api/mentor", { signal: controller.signal });

      if (!res.ok) {
        const text = await res.text();
        if (text === "not_enough_trades") {
          setErrorMsg(t("mentor.noTrades"));
        } else {
          setErrorMsg(t("mentor.error"));
        }
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        // Check for API error sentinel (null-byte prefix)
        if (full.includes("\x00ERR\x00")) {
          const errMsg = full.split("\x00ERR\x00")[1] ?? t("mentor.error");
          setErrorMsg(errMsg);
          setStatus("error");
          return;
        }
        setAnalysis(full);
      }

      setStatus("done");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrorMsg(t("mentor.error"));
        setStatus("error");
      }
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStatus("done");
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-purple-500" />
              <h1 className="text-xl font-bold text-foreground">{t("mentor.title")}</h1>
            </div>
            <p className="text-sm text-fg-subtle">{t("mentor.subtitle")}</p>
            {tradeCount > 0 && (
              <p className="text-xs text-fg-subtle mt-1">
                {t("mentor.tradeCount").replace("{count}", String(tradeCount))}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {status === "streaming" && (
              <button
                type="button"
                onClick={stop}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border)] text-fg-muted hover:text-foreground hover:bg-surface2 transition-all"
              >
                {t("mentor.stop")}
              </button>
            )}
            {tradeCount >= MIN_TRADES ? (
              <button
                type="button"
                onClick={generate}
                disabled={status === "loading" || status === "streaming"}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all"
              >
                <Sparkles size={14} />
                {status === "loading" || status === "streaming"
                  ? t("mentor.generating")
                  : status === "done"
                  ? t("mentor.regenerate")
                  : t("mentor.generate")}
              </button>
            ) : (
              <div className="text-sm text-fg-subtle italic">{t("mentor.noTrades")}</div>
            )}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="card p-6 space-y-3 animate-pulse">
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className="h-3 bg-surface3 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="card p-5 border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* Streaming / Done analysis */}
      {(status === "streaming" || status === "done") && analysis && (
        <div className="card p-6">
          {status === "streaming" && (
            <div className="flex items-center gap-2 mb-4 text-purple-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              {t("mentor.thinking")}
            </div>
          )}
          <div className="prose prose-sm prose-invert max-w-none text-fg-muted leading-relaxed
            [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h2:first-child]:mt-0
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-fg-muted [&_h3]:mt-4 [&_h3]:mb-1
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_ul]:space-y-1 [&_li]:text-sm [&_li]:text-fg-muted
            [&_p]:text-sm [&_p]:text-fg-muted [&_p]:leading-relaxed
            [&_hr]:border-[var(--border)] [&_hr]:my-4">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          {status === "done" && (
            <p className="mt-6 text-[11px] text-fg-subtle border-t border-[var(--border)] pt-4">
              {t("mentor.disclaimer")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
