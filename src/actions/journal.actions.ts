"use server";

import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { journalSchema } from "@/lib/validations/journal.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJournalEntry(data: unknown) {
  const user = await requireUser();
  const parsed = journalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const id = crypto.randomUUID();
  const { error } = await supabase
    .from("JournalEntry")
    .insert({ id, ...parsed.data, userId: user.userId });
  if (error) {
    console.error("[createJournalEntry]", error);
    return { error: "Error al guardar la entrada" };
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
    .update({ ...parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[updateJournalEntry]", error);
    return { error: "Error al actualizar la entrada" };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const user = await requireUser();
  await supabase.from("JournalEntry").delete().eq("id", id).eq("userId", user.userId);
  revalidatePath("/journal");
  redirect("/journal");
}
