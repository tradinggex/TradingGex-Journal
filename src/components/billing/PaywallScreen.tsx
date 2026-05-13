"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, LineChart, BookOpen, Camera, Globe, Check } from "lucide-react";
import type { SubscriptionStatus } from "@/lib/subscription";

interface Props {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  userEmail: string;
}

const FEATURES = [
  { Icon: BarChart3,   title: "Dashboard completo",            desc: "Equity curve, calendario de P&L y estadísticas en tiempo real" },
  { Icon: TrendingUp,  title: "Registro ilimitado de trades",  desc: "Futuros CME, Crypto, Forex, Opciones y más" },
  { Icon: LineChart,   title: "Analítica avanzada",            desc: "Win rate, profit factor, drawdown, distribución de R" },
  { Icon: BookOpen,    title: "Diario emocional",              desc: "Seguimiento de psicología y disciplina por sesión" },
  { Icon: Camera,      title: "Capturas de pantalla",          desc: "Adjunta imágenes a cada operación para revisión" },
  { Icon: Globe,       title: "Multi-idioma",                  desc: "Español, inglés y portugués incluidos" },
];

export function PaywallScreen({ subscriptionStatus, trialEndsAt, userEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialExpired =
    subscriptionStatus === "trialing" &&
    (!trialEndsAt || new Date(trialEndsAt) <= new Date());

  const isPastDue = subscriptionStatus === "past_due";

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError("No se pudo iniciar el proceso de pago. Intenta de nuevo.");
        setLoading(false);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
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
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Tu prueba gratuita ha terminado</h1>
              <p className="text-fg-subtle mt-2 text-sm sm:text-base max-w-md mx-auto">Suscríbete para seguir accediendo a tu journal de trading y todos tus datos.</p>
            </>
          )}
          {isPastDue && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Pago pendiente</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">Hubo un problema con tu pago. Actualiza tu método de pago para recuperar el acceso.</p>
            </>
          )}
          {subscriptionStatus === "canceled" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Tu suscripción ha sido cancelada</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">Vuelve a suscribirte para acceder a TradingGex Journal.</p>
            </>
          )}
          {!trialExpired && !isPastDue && subscriptionStatus !== "canceled" && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Activa tu suscripción</h1>
              <p className="text-fg-subtle mt-2 text-sm max-w-md mx-auto">Acceso completo a TradingGex Journal.</p>
            </>
          )}
        </div>

        {/* Pricing card */}
        <div className="bg-surface border border-purple-500/30 rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "0 0 32px rgba(168,85,247,0.08)" }}>
          {/* Price header */}
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-700/10 border-b border-purple-500/20 px-6 py-5 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-foreground">$19.99</span>
              <span className="text-fg-subtle text-sm">/mes</span>
            </div>
            <p className="text-xs text-purple-400 mt-1 font-medium">Facturación mensual · Cancela cuando quieras</p>
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
              {loading ? "Redirigiendo a pago…" : isPastDue ? "Actualizar método de pago" : "Suscribirme ahora — $19.99/mes"}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-fg-subtle">
              <Check size={11} strokeWidth={2.5} className="text-emerald-400" />
              <span>Pago seguro con Stripe · Cancela en cualquier momento</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-fg-subtle text-center">
          Sesión iniciada como{" "}
          <span className="text-foreground font-medium">{userEmail}</span>
          {" · "}
          <a href="/login" className="underline underline-offset-2 hover:text-foreground transition-colors">Cambiar cuenta</a>
        </p>
      </div>
    </div>
  );
}
