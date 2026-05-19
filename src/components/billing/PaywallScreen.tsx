"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, LineChart, BookOpen, Camera, Globe, Check } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/subscription";
import { useTranslation } from "@/lib/i18n/context";

interface Props {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  userEmail: string;
}

export function PaywallScreen({ subscriptionStatus, trialEndsAt, userEmail }: Props) {
  const t = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialExpired =
    subscriptionStatus === "trialing" &&
    (!trialEndsAt || new Date(trialEndsAt) <= new Date());

  const isPastDue = subscriptionStatus === "past_due";

  const FEATURES = [
    { Icon: BarChart3,  title: t("paywall.features.dashboard"),   desc: t("paywall.features.dashboardDesc") },
    { Icon: TrendingUp, title: t("paywall.features.trades"),      desc: t("paywall.features.tradesDesc") },
    { Icon: LineChart,  title: t("paywall.features.analytics"),   desc: t("paywall.features.analyticsDesc") },
    { Icon: BookOpen,   title: t("paywall.features.journal"),     desc: t("paywall.features.journalDesc") },
    { Icon: Camera,     title: t("paywall.features.screenshots"), desc: t("paywall.features.screenshotsDesc") },
    { Icon: Globe,      title: t("paywall.features.multilang"),   desc: t("paywall.features.multilangDesc") },
  ];

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(t("paywall.errorGeneric"));
        setLoading(false);
      }
    } catch {
      setError(t("paywall.errorNetwork"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 mb-4" style={{ boxShadow: "0 0 24px rgba(168,85,247,0.2)" }}>
            <span className="text-2xl font-black text-purple-400" style={{ textShadow: "0 0 12px rgba(192,132,252,0.8)" }}>TG</span>
          </div>

          {trialExpired && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{t("paywall.trialExpiredTitle")}</h1>
              <p className="text-fg-subtle mt-2 text-sm sm:text-base max-w-md mx-auto">{t("paywall.trialExpiredDesc")}</p>
            </>
          )}
          {isPastDue && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{t("paywall.pastDueTitle")}</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">{t("paywall.pastDueDesc")}</p>
            </>
          )}
          {subscriptionStatus === "canceled" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{t("paywall.canceledTitle")}</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">{t("paywall.canceledDesc")}</p>
            </>
          )}
          {!trialExpired && !isPastDue && subscriptionStatus !== "canceled" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{t("paywall.defaultTitle")}</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">{t("paywall.defaultDesc")}</p>
            </>
          )}
        </div>

        {/* Pricing card */}
        <div className="bg-surface border border-purple-500/30 rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "0 0 32px rgba(168,85,247,0.08)" }}>
          {/* Price header */}
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-700/10 border-b border-purple-500/20 px-6 py-5 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-foreground">$19.99</span>
              <span className="text-fg-subtle text-sm">{t("paywall.perMonth")}</span>
            </div>
            <p className="text-xs text-purple-400 mt-1 font-medium">{t("paywall.billingNote")}</p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-white/5 sm:divide-y-0">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 px-5 py-3.5 sm:border-b sm:border-white/5 last:border-0 sm:odd:border-r sm:odd:border-white/5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <f.Icon size={13} className="text-purple-400" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-fg-subtle mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-6 py-5 border-t border-white/8">
            {error && <p className="text-sm text-red-400 text-center mb-3">{error}</p>}
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: "0 0 20px rgba(168,85,247,0.3)" }}
            >
              {loading ? t("paywall.redirecting") : isPastDue ? t("paywall.updatePayment") : t("paywall.subscribe")}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-fg-subtle">
              <Check size={11} strokeWidth={2.5} className="text-emerald-400" />
              <span>{t("paywall.securePayment")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-fg-subtle text-center">
          {t("paywall.loggedAs")}{" "}
          <span className="text-foreground font-medium">{userEmail}</span>
          {" · "}
          <a href="/login" className="underline underline-offset-2 hover:text-foreground transition-colors">{t("paywall.switchAccount")}</a>
        </p>
      </div>
    </div>
  );
}
