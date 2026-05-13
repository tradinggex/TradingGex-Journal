import "server-only";
import { cookies } from "next/headers";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import type { Dict, Locale } from "./locales/en";

export type { Dict, Locale };

const dictionaries: Record<Locale, Dict> = { en, es, pt };

export function isLocale(value: string): value is Locale {
  return value in dictionaries;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("NEXT_LOCALE")?.value ?? "";
  return isLocale(value) ? value : "en";
}

export async function getDictionary(locale?: Locale): Promise<Dict> {
  const l = locale ?? (await getLocale());
  return dictionaries[l];
}
