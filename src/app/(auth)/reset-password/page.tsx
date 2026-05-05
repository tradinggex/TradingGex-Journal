"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword, type ResetState } from "@/actions/password-reset.actions";

const inputCls =
  "w-full bg-surface2 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition-all border-0";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, undefined);

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Enlace inválido. Solicita un nuevo enlace de recuperación.
        </div>
        <Link
          href="/forgot-password"
          className="block text-center w-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          ¡Contraseña actualizada correctamente!
        </div>
        <Link
          href="/login"
          className="block text-center w-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      {state?.error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
          {(state.error.includes("expirado") || state.error.includes("inválido")) && (
            <span>
              {" "}
              <Link href="/forgot-password" className="underline hover:text-red-300">
                Solicitar uno nuevo.
              </Link>
            </span>
          )}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-fg-muted mb-1.5">
            Nueva contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputCls}
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-fg-muted mb-1.5">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={inputCls}
            placeholder="Repite la contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
        >
          {pending ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>

      <p className="text-center text-xs text-fg-subtle mt-6">
        <Link href="/login" className="text-purple-500 hover:text-purple-400 transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-2xl font-black tracking-tight mb-1">
          TradingG<span className="text-purple-500">ex</span>
        </div>
        <div className="text-xs text-fg-subtle tracking-widest uppercase">Trading Journal</div>
      </div>

      <div className="card p-8">
        <h1 className="text-xl font-bold text-foreground mb-1">Nueva contraseña</h1>
        <p className="text-sm text-fg-subtle mb-6">Elige una contraseña segura para tu cuenta.</p>

        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
