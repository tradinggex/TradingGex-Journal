"use client";

import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isStaleAction =
    error.message?.includes("Server Action") ||
    error.digest === "2078528462";

  return (
    <div className="w-full max-w-sm text-center">
      <div className="card p-8 space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          {isStaleAction ? "Sesión desactualizada" : "Algo salió mal"}
        </h2>
        <p className="text-sm text-fg-muted">
          {isStaleAction
            ? "La página está desactualizada. Por favor recarga para continuar."
            : "Ocurrió un error inesperado."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm py-2.5 rounded-xl transition-all"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
