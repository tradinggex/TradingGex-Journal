"use server";

import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { journalSchema } from "@/lib/validations/journal.schema";
import { revalidatePath } from "next/cache";

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));
}

export async function createJournalEntry(data: unknown) {
  const user = await requireUser();
  const parsed = journalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("JournalEntry")
    .insert(stripNulls({ id, ...parsed.data, userId: user.userId, createdAt: now, updatedAt: now }));
  if (error) {
    console.error("[createJournalEntry] code=%s msg=%s", error?.code, error?.message);
    return { error: error?.message ?? "Error al guardar la entrada" };
  }
  revalidatePath("/journal");
  return { success: true, id };
}

export async function updateJournalEntry(id: string, data: unknown) {
  const user = await requireUser();
  const parsed = journalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { data: existing } = await supabase
    .from("JournalEntry")
    .select("id")
    .eq("id", id)
    .eq("userId", user.userId)
    .maybeSingle();

  if (!existing) return { error: "No encontrado" };

  const { error } = await supabase
    .from("JournalEntry")
    .update(stripNulls({ ...parsed.data, updatedAt: new Date().toISOString() }))
    .eq("id", id);

  if (error) {
    console.error("[updateJournalEntry] code=%s msg=%s", error?.code, error?.message);
    return { error: error?.message ?? "Error al actualizar la entrada" };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const user = await requireUser();
  await supabase.from("JournalEntry").delete().eq("id", id).eq("userId", user.userId);
  revalidatePath("/journal");
  return { success: true };
}
