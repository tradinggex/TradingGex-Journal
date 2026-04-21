"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { tradeSchema } from "@/lib/validations/trade.schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTrade(data: unknown) {
  const user = await requireUser();
  const parsed = tradeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { tagIds, ...values } = parsed.data;

  const trade = await prisma.trade.create({
    data: {
      ...values,
      userId: user.userId,
      entryAt: new Date(values.entryAt),
      exitAt: values.exitAt ? new Date(values.exitAt) : null,
      tags: tagIds?.length
        ? { create: tagIds.map((id) => ({ tag: { connect: { id } } })) }
        : undefined,
    },
  });

  revalidatePath("/trades");
  revalidatePath("/");
  return { success: true, id: trade.id };
}

export async function updateTrade(id: string, data: unknown) {
  const user = await requireUser();
  const parsed = tradeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { tagIds, ...values } = parsed.data;

  // Verify ownership
  const existing = await prisma.trade.findFirst({ where: { id, userId: user.userId } });
  if (!existing) return { error: "No encontrado" };

  await prisma.tradeTag.deleteMany({ where: { tradeId: id } });

  await prisma.trade.update({
    where: { id },
    data: {
      ...values,
      entryAt: new Date(values.entryAt),
      exitAt: values.exitAt ? new Date(values.exitAt) : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tid) => ({ tag: { connect: { id: tid } } })) }
        : undefined,
    },
  });

  revalidatePath("/trades");
  revalidatePath(`/trades/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteTrade(id: string) {
  const user = await requireUser();
  await prisma.trade.deleteMany({ where: { id, userId: user.userId } });
  revalidatePath("/trades");
  revalidatePath("/");
  redirect("/trades");
}
