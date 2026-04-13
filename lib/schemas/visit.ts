import { z } from "zod";

export const visitSchema = z.object({
  path: z.string().min(1).max(512),
  referrer: z.string().max(2048).optional(),
  title: z.string().max(512).optional(),
});

export type VisitInput = z.infer<typeof visitSchema>;
