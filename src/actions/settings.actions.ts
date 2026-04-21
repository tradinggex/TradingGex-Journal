"use server";

import { prisma } from "@/lib/prisma";
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
  const instrument = await prisma.instrument.create({ data: parsed.data });
  revalidatePath("/settings");
  return { success: true, id: instrument.id };
}

export async function updateInstrument(id: string, data: unknown) {
  const parsed = instrumentSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  await prisma.instrument.update({ where: { id }, data: parsed.data });
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteInstrument(id: string) {
  await prisma.instrument.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}

export async function toggleInstrument(id: string, isActive: boolean) {
  await prisma.instrument.update({ where: { id }, data: { isActive } });
  revalidatePath("/settings");
  return { success: true };
}

// --- Setups ---
export async function createSetup(data: unknown) {
  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const setup = await prisma.setup.create({ data: parsed.data });
  revalidatePath("/settings");
  return { success: true, id: setup.id };
}

export async function updateSetup(id: string, data: unknown) {
  const parsed = setupSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  await prisma.setup.update({ where: { id }, data: parsed.data });
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteSetup(id: string) {
  await prisma.setup.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}

// --- Tags ---
export async function createTag(name: string, color: string) {
  const tag = await prisma.tag.create({ data: { name, color } });
  revalidatePath("/settings");
  return { success: true, id: tag.id };
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}
