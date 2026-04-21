import { z } from "zod";

export const journalSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  sessionSummary: z.string().optional().nullable(),
  emotionalState: z.string().optional().nullable(),
  disciplineScore: z.coerce.number().min(1).max(10).optional().nullable(),
  followedRules: z.boolean().optional().nullable(),
  marketCondition: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  improvements: z.string().optional().nullable(),
  gratitude: z.string().optional().nullable(),
});

export type JournalFormValues = z.infer<typeof journalSchema>;
