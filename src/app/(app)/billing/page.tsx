"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowLeft, Clock, AlertTriangle, RefreshCw, X, CreditCard, Check } from "lucide-react";

const FEATURES = [
  "Registro ilimitado de trades",
  "Dashboard con equity curve y calendario",
  "Analítica avanzada (drawdown, profit factor, R)",
  "Diario emocional y psicología",
  "Capturas de pantalla en trades",
  "Multi-idioma (ES / EN / PT)",
];

function SuccessBanner() {
  const params = useSearchParams();
  const subscribed = params.get("subscribed");
  if (!subscribed) return null;
  return (
    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30">
      <Sparkles size={18} className="text-emerald-400 shrink-0" strokeWidth={1.75} />
      <div>
        <p className="text-sm font-semibold text-emerald-400">¡Suscripción activada!</p>
        <p className="text-xs text-fg-subtle mt-0.5">Ya tienes acceso completo a TradingGex Journal.</p>
      </div>
    </div>
  );
}

function CanceledBanner() {
  const params = useSearchParams();
  const canceled = params.get("canceled");
  if (!canceled) return null;
  return (
    <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/30">
      <ArrowLeft size={18} className="text-amber-400 shrink-0" strokeWidth={1.75} />
      <p className="text-sm text-amber-400">Has cancelado el proceso de pago. Puedes intentarlo de nuevo cuando quieras.</p>
    </div>
  );
}

interface SubData {
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { label: string; className: string }> = {
    active:     { label: "Activa",        className: "bg-emerald-400/15 text-emerald-400 border-emerald-400/30" },
    trialing:   { label: "Prueba gratis", className: "bg-amber-400/15 text-amber-400 border-amber-400/30" },
    canceled:   { label: "Cancelada",     className: "bg-red-400/15 text-red-400 border-red-400/30" },
    past_due:   { label: "Pago pendiente",className: "bg-orange-400/15 text-orange-400 border-orange-400/30" },
    incomplete: { label: "Incompleto",    className: "bg-fg-subtle/15 text-fg-subtle border-white/10" },
  };
  const s = status ? (map[status] ?? { label: status, className: "bg-surface2 text-fg-subtle border-white/10" }) : map.trialing;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((d) => { setSub(d); setLoading(false); })
      .catch(() => { setError("Error cargando información de facturación."); setLoading(false); });
  }, []);

  async function handleSubscribe() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else { setError("Error al crear la sesión de pago."); setActionLoading(false); }
    } catch { setError("Error de red."); setActionLoading(false); }
  }

  async function handlePortal() {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else { setError("Error al abrir el portal de facturación."); setActionLoading(false); }
    } catch { setError("Error de red."); setActionLoading(false); }
  }

  const status = sub?.subscriptionStatus;
  const isActive = status === "active";
  const isTrialing = status === "trialing";
  const trialExpired = isTrialing && sub?.trialEndsAt && new Date(sub.trialEndsAt) <= new Date();
  const needsSubscription = !isActive && (!isTrialing || trialExpired);
  const hasStripeCustomer = !!sub?.stripeCustomerId;

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Banners */}
      <Suspense fallback={null}><SuccessBanner /></Suspense>
      <Suspense fallback={null}><CanceledBanner /></Suspense>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturación</h1>
        <p className="text-sm text-fg-subtle mt-1">Gestiona tu suscripción a TradingGex Journal</p>
      </div>

      {/* Current plan card */}
      <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Plan actual</h2>
          {!loading && sub && <StatusBadge status={sub.subscriptionStatus} />}
        </div>

        <div className="px-5 py-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-surface2 rounded w-1/3" />
              <div className="h-4 bg-surface2 rounded w-1/2" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">TradingGex Journal</p>
                  <p className="text-xs text-fg-subtle mt-0.5">
                    {isActive ? "$19.99 / mes" : isTrialing && !trialExpired ? "Prueba gratuita de 3 días" : "$19.99 / mes"}
                  </p>
                </div>
                {(isActive || (isTrialing && !trialExpired)) && (
                  <Check size={20} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                )}
              </div>

              {/* Trial / period details */}
              {isTrialing && !trialExpired && sub?.trialEndsAt && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-400/8 border border-amber-400/20">
                  <Clock size={14} className="text-amber-400 shrink-0" strokeWidth={1.75} />
                  <p className="text-xs text-amber-400">
                    Prueba gratuita activa hasta el <strong>{fmtDate(sub.trialEndsAt)}</strong>
                  </p>
                </div>
              )}
              {isTrialing && trialExpired && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-400/8 border border-red-400/20">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" strokeWidth={1.75} />
                  <p className="text-xs text-red-400">Tu prueba gratuita ha expirado. Suscríbete para seguir usando la app.</p>
                </div>
              )}
              {isActive && sub?.currentPeriodEnd && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-400/8 border border-emerald-400/20">
                  <RefreshCw size={14} className="text-emerald-400 shrink-0" strokeWidth={1.75} />
                  <p className="text-xs text-emerald-400">
                    Próxima factura el <strong>{fmtDate(sub.currentPeriodEnd)}</strong>
                  </p>
                </div>
              )}
              {status === "canceled" && sub?.currentPeriodEnd && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-400/8 border border-red-400/20">
                  <X size={14} className="text-red-400 shrink-0" strokeWidth={2} />
                  <p className="text-xs text-red-400">
                    Acceso hasta el <strong>{fmtDate(sub.currentPeriodEnd)}</strong>. Puedes reactivar antes de esa fecha.
                  </p>
                </div>
              )}
              {status === "past_due" && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-400/8 border border-orange-400/20">
                  <CreditCard size={14} className="text-orange-400 shrink-0" strokeWidth={1.75} />
                  <p className="text-xs text-orange-400">Hay un problema con tu pago. Actualiza tu método de pago para mantener el acceso.</p>
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {needsSubscription && (
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold transition-colors disabled:opacity-60"
                  >
                    {actionLoading ? "Redirigiendo…" : "Suscribirme — $19.99/mes"}
                  </button>
                )}
                {isActive && hasStripeCustomer && (
                  <>
                    <button
                      type="button"
                      onClick={handlePortal}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-surface2 hover:bg-surface3 border border-white/10 text-sm font-medium text-foreground transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? "Abriendo…" : "Gestionar suscripción"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePortal}
                      disabled={actionLoading}
                      className="py-2.5 px-4 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/8 text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {status === "past_due" && hasStripeCustomer && (
                  <button
                    type="button"
                    onClick={handlePortal}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors disabled:opacity-60"
                  >
                    {actionLoading ? "Abriendo…" : "Actualizar método de pago"}
                  </button>
                )}
                {status === "canceled" && (
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-bold transition-colors disabled:opacity-60"
                  >
                    {actionLoading ? "Redirigiendo…" : "Reactivar suscripción"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* What's included */}
      <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-foreground">Incluido en el plan</h2>
        </div>
        <ul className="divide-y divide-white/5">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 px-5 py-3">
              <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
              <span className="text-sm text-fg-subtle">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-foreground">Preguntas frecuentes</h2>
        </div>
        <div className="divide-y divide-white/5">
          {[
            ["¿Puedo cancelar en cualquier momento?", "Sí. Puedes cancelar desde el portal de facturación y seguirás teniendo acceso hasta el final del período pagado."],
            ["¿Qué pasa con mis datos si cancelo?", "Todos tus trades, diario y configuraciones se conservan. Si vuelves a suscribirte, todo sigue igual."],
            ["¿Cómo funciona la prueba gratuita?", "Tienes 3 días de acceso completo sin tarjeta de crédito. Al terminar, necesitas suscribirte para continuar."],
            ["¿Los pagos son seguros?", "Sí. Los pagos se procesan con Stripe. No almacenamos datos de tarjeta en nuestros servidores."],
          ].map(([q, a]) => (
            <div key={q} className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground">{q}</p>
              <p className="text-xs text-fg-subtle mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-fg-subtle text-center pb-4">
        Pagos seguros procesados por{" "}
        <span className="text-foreground font-medium">Stripe</span>
        {" · "}
        <a href="mailto:support@tradinggexjournal.com" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Soporte
        </a>
      </p>
    </div>
  );
}
