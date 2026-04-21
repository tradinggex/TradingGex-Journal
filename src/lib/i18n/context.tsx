"use client";

import React, { createContext, useContext } from "react";
import type { Dict } from "./locales/en";

type Params = Record<string, string | number>;

function interpolate(str: string, params?: Params): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`
  );
}

// Resolve a dot-notation path against the Dict object
function resolve(obj: unknown, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "string") return current;
  return path;
}

type TFunction = (key: string, params?: Params) => string;

const I18nContext = createContext<TFunction>(() => "");

export function I18nProvider({
  dict,
  children,
}: {
  dict: Dict;
  children: React.ReactNode;
}) {
  const t: TFunction = (key, params) => {
    const raw = resolve(dict, key);
    return interpolate(raw, params);
  };

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}

export function useTranslation(): TFunction {
  return useContext(I18nContext);
}
