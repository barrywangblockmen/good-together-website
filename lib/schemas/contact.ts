import { z } from "zod";

export const contactBodySchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().email(),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    message: z.string().trim().min(10).max(2000),
    consent: z.literal(true),
  })
  .superRefine((data, ctx) => {
    if (data.phone !== undefined) {
      if (data.phone.length < 8 || data.phone.length > 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "電話長度須為 8～20 字元",
          path: ["phone"],
        });
      }
    }
  });

export type ContactBody = z.infer<typeof contactBodySchema>;
