"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0c0e14] text-white flex flex-col items-center justify-center text-center px-4">
        <Zap size={40} strokeWidth={1.25} className="mb-4 text-red-400" />
        <h1 className="text-xl font-bold mb-2">Error crítico</h1>
        <p className="text-sm text-slate-400 mb-6">
          La aplicación encontró un error grave. Por favor recarga la página.
        </p>
        <button
          onClick={reset}
          className="bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
        >
          Recargar
        </button>
      </body>
    </html>
  );
}
