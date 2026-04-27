"use server";

import { supabase } from "@/lib/supabase";
import { instrumentSchema, setupSchema } from "@/lib/validations/settings.schema";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

// --- Instruments ---
export async function createInstrument(data: unknown) {
  const parsed = instrumentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const id = crypto.randomUUID();
  const { error } = await supabase.from("Instrument").insert({ id, ...parsed.data });
  if (error) return { error: "Error al crear instrumento" };
  revalidatePath("/settings");
  return { success: true, id };
}

export async function updateInstrument(id: string, data: unknown) {
  const parsed = instrumentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const { error } = await supabase
    .from("Instrument")
    .update({ ...parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "Error al actualizar instrumento" };
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteInstrument(id: string) {
  await supabase.from("Instrument").delete().eq("id", id);
  revalidatePath("/settings");
  return { success: true };
}

export async function toggleInstrument(id: string, isActive: boolean) {
  await supabase.from("Instrument").update({ isActive, updatedAt: new Date().toISOString() }).eq("id", id);
  revalidatePath("/settings");
  return { success: true };
}

// --- Setups ---
export async function createSetup(data: unknown) {
  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const id = crypto.randomUUID();
  const { error } = await supabase.from("Setup").insert({ id, ...parsed.data });
  if (error) return { error: "Error al crear setup" };
  revalidatePath("/settings");
  return { success: true, id };
}

export async function updateSetup(id: string, data: unknown) {
  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const { error } = await supabase
    .from("Setup")
    .update({ ...parsed.data, updatedAt: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: "Error al actualizar setup" };
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteSetup(id: string) {
  await supabase.from("Setup").delete().eq("id", id);
  revalidatePath("/settings");
  return { success: true };
}

// --- Tags ---
export async function createTag(name: string, color: string) {
  const id = crypto.randomUUID();
  const { error } = await supabase.from("Tag").insert({ id, name, color });
  if (error) return { error: "Error al crear etiqueta" };
  revalidatePath("/settings");
  return { success: true, id };
}

export async function deleteTag(id: string) {
  await supabase.from("Tag").delete().eq("id", id);
  revalidatePath("/settings");
  return { success: true };
}
