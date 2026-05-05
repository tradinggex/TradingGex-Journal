"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteJournalEntry } from "@/actions/journal.actions";
import { useTranslation } from "@/lib/i18n/context";

export function DeleteJournalButton({ entryId }: { entryId: string }) {
  const t = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("journal.delete.confirm"))) return;
    startTransition(async () => {
      try {
        await deleteJournalEntry(entryId);
        toast.success(t("journal.delete.success"));
        router.push("/journal");
      } catch {
        toast.error("Error al eliminar la entrada");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 text-xs px-3 py-2 rounded-lg transition-colors font-mono disabled:opacity-50"
    >
      {isPending ? t("journal.delete.deleting") : t("journal.delete.button")}
    </button>
  );
}
