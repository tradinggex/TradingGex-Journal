"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/actions/admin.actions";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}

export function DeleteUserButton({ userId, userName, userEmail, isAdmin }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    return (
      <span className="text-xs text-fg-subtle italic">admin</span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-fg-subtle text-right max-w-[180px]">
        ¿Eliminar a <span className="text-foreground font-medium">{userName || userEmail}</span>?
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
              const res = await deleteUser(userId);
              if (res.error) setError(res.error);
              else setConfirming(false);
            })
          }
          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
        >
          {isPending ? "Eliminando…" : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
