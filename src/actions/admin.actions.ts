"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tradinggex@gmail.com";

async function requireAdmin() {
  const session = await requireUser();
  if (session.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function grantPro(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const { error } = await supabase
      .from("User")
      .update({
        subscriptionStatus: "active",
        currentPeriodEnd: "2099-12-31T23:59:59.000Z",
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
    revalidatePath("/admin");
    return {};
  } catch (err) {
    console.error("[grantPro]", err);
    return { error: "Error al otorgar acceso Pro." };
  }
}

export async function revokePro(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const { error } = await supabase
      .from("User")
      .update({
        subscriptionStatus: "canceled",
        currentPeriodEnd: null,
        stripeSubscriptionId: null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw error;
    revalidatePath("/admin");
    return {};
  } catch (err) {
    console.error("[revokePro]", err);
    return { error: "Error al revocar acceso Pro." };
  }
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();

    // Prevent self-deletion
    const session = await requireUser();
    if (session.userId === userId) {
      return { error: "No puedes eliminar tu propia cuenta." };
    }

    // Cascade: delete screenshots, trade tags, trades, journal entries, oauth accounts, then user
    const { error } = await supabase.from("User").delete().eq("id", userId);
    if (error) throw error;

    revalidatePath("/admin");
    return {};
  } catch (err) {
    console.error("[deleteUser]", err);
    return { error: "Error al eliminar el usuario." };
  }
}
