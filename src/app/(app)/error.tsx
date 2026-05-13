"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle size={40} strokeWidth={1.25} className="mb-4 text-amber-400" />
      <h2 className="text-lg font-bold text-foreground mb-2">Algo salió mal</h2>
      <p className="text-sm text-fg-muted mb-6 max-w-sm">
        Ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border border-[var(--border)] text-fg-muted hover:text-foreground text-sm px-4 py-2 rounded-xl transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
