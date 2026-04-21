import { z } from "zod";

export const instrumentSchema = z.object({
  symbol: z.string().min(1, "El símbolo es requerido").toUpperCase(),
  name: z.string().min(1, "El nombre es requerido"),
  market: z.enum(["CME", "STOCKS", "CRYPTO", "FOREX", "GENERIC"]),
  tickSize: z.coerce.number().positive("Tick size debe ser mayor a 0"),
  tickValue: z.coerce.number().positive("Tick value debe ser mayor a 0"),
  currency: z.string().default("USD"),
  exchange: z.string().optional().nullable(),
  contractSize: z.coerce.number().positive().default(1),
  isActive: z.boolean().default(true),
});

export const setupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  color: z.string().default("#6366f1"),
  isActive: z.boolean().default(true),
});

export type InstrumentFormValues = z.infer<typeof instrumentSchema>;
export type SetupFormValues = z.infer<typeof setupSchema>;
