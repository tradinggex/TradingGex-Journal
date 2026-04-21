"use server";

import { prisma } from "@/lib/prisma";
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
  const entry = await prisma.journalEntry.create({
    data: { ...parsed.data, userId: user.userId },
  });
  revalidatePath("/journal");
  return { success: true, id: entry.id };
}

export async function updateJournalEntry(id: string, data: unknown) {
  const user = await requireUser();
  const parsed = journalSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.userId } });
  if (!existing) return { error: "No encontrado" };

  await prisma.journalEntry.update({ where: { id }, data: parsed.data });
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return { success: true };
}

export async function deleteJournalEntry(id: string) {
  const user = await requireUser();
  await prisma.journalEntry.deleteMany({ where: { id, userId: user.userId } });
  revalidatePath("/journal");
  redirect("/journal");
}
