"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").trim(),
  email: z.string().email("Email inválido").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Email inválido").trim().toLowerCase(),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  try {
    const { data: existing } = await supabase.from("User").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return { errors: { email: ["Este email ya está registrado"] } };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    const { data: user, error } = await supabase
      .from("User")
      .insert({ id, name, email, passwordHash })
      .select("id, email, name")
      .single();

    if (error || !user) throw error ?? new Error("Failed to create user");
    await createSession(user.id, user.email, user.name);
  } catch (err) {
    console.error("[register]", err);
    return { message: "Error al conectar con la base de datos. Intenta de nuevo." };
  }

  return { success: true };
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  try {
    const { data: user, error } = await supabase
      .from("User")
      .select("id, email, name, passwordHash")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!user || !user.passwordHash) {
      return { message: "Email o contraseña incorrectos" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { message: "Email o contraseña incorrectos" };
    }

    await createSession(user.id, user.email, user.name);
  } catch (err) {
    console.error("[login]", err);
    return { message: "Error al conectar con la base de datos. Intenta de nuevo." };
  }

  return { success: true };
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
