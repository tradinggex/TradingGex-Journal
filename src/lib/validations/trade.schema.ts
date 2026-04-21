import { z } from "zod";

export const tradeSchema = z.object({
  instrumentId: z.string().min(1, "Selecciona un instrumento"),
  setupId: z.string().optional().nullable(),
  direction: z.enum(["LONG", "SHORT"]),
  size: z.coerce.number().positive("El tamaño debe ser mayor a 0"),
  status: z.enum(["OPEN", "CLOSED", "CANCELLED"]).default("CLOSED"),
  entryPrice: z.coerce.number().positive("Precio de entrada requerido"),
  exitPrice: z.coerce.number().positive().optional().nullable(),
  stopLoss: z.coerce.number().positive().optional().nullable(),
  takeProfit: z.coerce.number().positive().optional().nullable(),
  entryAt: z.string().min(1, "Fecha de entrada requerida"),
  exitAt: z.string().optional().nullable(),
  grossPnl: z.coerce.number().optional().nullable(),
  fees: z.coerce.number().min(0).default(0),
  netPnl: z.coerce.number().optional().nullable(),
  riskAmount: z.coerce.number().positive().optional().nullable(),
  rMultiple: z.coerce.number().optional().nullable(),
  plannedR: z.coerce.number().optional().nullable(),
  quality: z.coerce.number().min(1).max(5).optional().nullable(),
  emotion: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  mistakes: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
});

export type TradeFormValues = z.infer<typeof tradeSchema>;
