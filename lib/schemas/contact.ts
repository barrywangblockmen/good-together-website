import { z } from "zod";

export const contactBodySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  phone: z.preprocess(
    (val) => {
      if (val == null || val === "") return undefined;
      return String(val).trim();
    },
    z.union([z.undefined(), z.string().min(8).max(20)])
  ),
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
});

export type ContactBody = z.infer<typeof contactBodySchema>;
