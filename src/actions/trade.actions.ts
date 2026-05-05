"use server";

import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { tradeSchema } from "@/lib/validations/trade.schema";
import { revalidatePath } from "next/cache";

function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));
}

export async function createTrade(data: unknown) {
  const user = await requireUser();
  const parsed = tradeSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { tagIds, ...values } = parsed.data;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const insertPayload = stripNulls({
    id,
    ...values,
    userId: user.userId,
    entryAt: new Date(values.entryAt).toISOString(),
    exitAt: values.exitAt ? new Date(values.exitAt).toISOString() : null,
    createdAt: now,
    updatedAt: now,
  });

  const { data: trade, error } = await supabase
    .from("Trade")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !trade) {
    console.error("[createTrade] code=%s msg=%s", error?.code, error?.message);
    return { error: error?.message ?? "Error al guardar el trade" };
  }

  if (tagIds?.length) {
    await supabase.from("TradeTag").insert(tagIds.map((tagId) => ({ tradeId: trade.id, tagId })));
  }

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

  const { data: existing } = await supabase
    .from("Trade")
    .select("id")
    .eq("id", id)
    .eq("userId", user.userId)
    .maybeSingle();

  if (!existing) return { error: "No encontrado" };

  await supabase.from("TradeTag").delete().eq("tradeId", id);

  const updatePayload = stripNulls({
    ...values,
    entryAt: new Date(values.entryAt).toISOString(),
    exitAt: values.exitAt ? new Date(values.exitAt).toISOString() : null,
    updatedAt: new Date().toISOString(),
  });

  const { error } = await supabase
    .from("Trade")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("[updateTrade] code=%s msg=%s", error?.code, error?.message);
    return { error: error?.message ?? "Error al actualizar el trade" };
  }

  if (tagIds?.length) {
    await supabase.from("TradeTag").insert(tagIds.map((tagId) => ({ tradeId: id, tagId })));
  }

  revalidatePath("/trades");
  revalidatePath(`/trades/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteTrade(id: string) {
  const user = await requireUser();
  await supabase.from("Trade").delete().eq("id", id).eq("userId", user.userId);
  revalidatePath("/trades");
  revalidatePath("/");
  return { success: true };
}
