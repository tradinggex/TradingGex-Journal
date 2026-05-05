"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteTrade } from "@/actions/trade.actions";
import { useTranslation } from "@/lib/i18n/context";

export function DeleteTradeButton({ tradeId }: { tradeId: string }) {
  const t = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("trades.delete.confirm"))) return;
    startTransition(async () => {
      try {
        await deleteTrade(tradeId);
        toast.success(t("trades.delete.success"));
        router.push("/trades");
      } catch {
        toast.error("Error al eliminar la operación");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 text-xs px-3 py-2 rounded-lg transition-colors font-mono disabled:opacity-50"
    >
      {isPending ? t("trades.delete.deleting") : t("trades.delete.button")}
    </button>
  );
}
