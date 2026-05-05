"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";

export type ResetState = { error?: string; success?: boolean } | undefined;

export async function requestPasswordReset(state: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = z.string().email().safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Ingresa un correo electrónico válido" };
  const email = parsed.data;

  const { data: user } = await supabase
    .from("User")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  // Always return success — don't reveal whether the email exists
  if (!user) return { success: true };

  // Invalidate any existing tokens
  await supabase.from("PasswordResetToken").delete().eq("userId", user.id);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { error: insertErr } = await supabase.from("PasswordResetToken").insert({
    userId: user.id,
    tokenHash,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  if (insertErr) {
    console.error("[requestPasswordReset]", insertErr.message);
    return { error: "Error al procesar la solicitud. Intenta de nuevo." };
  }

  try {
    await sendPasswordResetEmail(user.email, rawToken);
  } catch (err) {
    console.error("[sendPasswordResetEmail]", err);
    return { error: "Error al enviar el correo. Intenta de nuevo." };
  }

  return { success: true };
}

export async function resetPassword(state: ResetState, formData: FormData): Promise<ResetState> {
  const token = (formData.get("token") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!token) return { error: "Enlace inválido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (password !== confirmPassword) return { error: "Las contraseñas no coinciden." };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const { data: record } = await supabase
    .from("PasswordResetToken")
    .select("id, userId, expiresAt, usedAt")
    .eq("tokenHash", tokenHash)
    .maybeSingle();

  if (!record) return { error: "El enlace es inválido o ha expirado." };
  if (record.usedAt) return { error: "Este enlace ya fue utilizado. Solicita uno nuevo." };
  if (new Date(record.expiresAt) < new Date()) return { error: "El enlace ha expirado. Solicita uno nuevo." };

  const passwordHash = await bcrypt.hash(password, 12);

  await Promise.all([
    supabase
      .from("User")
      .update({ passwordHash, updatedAt: new Date().toISOString() })
      .eq("id", record.userId),
    supabase
      .from("PasswordResetToken")
      .update({ usedAt: new Date().toISOString() })
      .eq("id", record.id),
  ]);

  return { success: true };
}
