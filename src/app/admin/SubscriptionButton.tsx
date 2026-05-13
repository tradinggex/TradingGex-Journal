"use client";

import { useState, useTransition } from "react";
import { grantPro, revokePro } from "@/actions/admin.actions";

interface Props {
  userId: string;
  isAdmin: boolean;
  isPro: boolean;
}

export function SubscriptionButton({ userId, isAdmin, isPro }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) return null;

  if (!confirming) {
    return isPro ? (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs px-2.5 py-1 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
      >
        Revocar Pro
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
      >
        Otorgar Pro
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-fg-subtle text-right">
        {isPro ? "¿Revocar acceso Pro?" : "¿Otorgar acceso Pro?"}
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null); }}
          disabled={isPending}
          className="text-xs px-2.5 py-1 rounded-lg border border-white/10 text-fg-subtle hover:bg-surface2 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const action = isPro ? revokePro : grantPro;
              const res = await action(userId);
              if (res.error) setError(res.error);
              else setConfirming(false);
            })
          }
          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
            isPro
              ? "bg-orange-500/15 border-orange-500/40 text-orange-400 hover:bg-orange-500/25"
              : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
          }`}
        >
          {isPending ? "Guardando…" : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
