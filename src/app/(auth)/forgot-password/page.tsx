"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/actions/password-reset.actions";

const inputCls =
  "w-full bg-surface2 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all border-0";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestPasswordReset, undefined);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-2xl font-black tracking-tight mb-1">
          TradingG<span className="text-purple-500">ex</span>
        </div>
        <div className="text-xs text-fg-subtle tracking-widest uppercase">Trading Journal</div>
      </div>

      <div className="card p-8">
        <h1 className="text-xl font-bold text-foreground mb-1">¿Olvidaste tu contraseña?</h1>
        <p className="text-sm text-fg-subtle mb-6">
          Ingresa tu correo y te enviaremos un enlace para recuperarla.
        </p>

        {state?.success ? (
          <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              Si ese correo está registrado, recibirás un enlace en los próximos minutos.
              Revisa también tu carpeta de spam.
            </div>
            <Link
              href="/login"
              className="block text-center w-full border border-[var(--border)] text-fg-muted hover:text-foreground text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            {state?.error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {state.error}
              </div>
            )}

            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-fg-muted mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputCls}
                  placeholder="tu@correo.com"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
              >
                {pending ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>

            <p className="text-center text-xs text-fg-subtle mt-6">
              <Link href="/login" className="text-purple-500 hover:text-purple-400 transition-colors">
                ← Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
