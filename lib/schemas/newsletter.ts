import { z } from "zod";
import { NEWSLETTER_TOPICS } from "@/lib/newsletter-topics";

const topicIdSchema = z.enum(
  NEWSLETTER_TOPICS.map((t) => t.id) as [
    (typeof NEWSLETTER_TOPICS)[number]["id"],
    ...(typeof NEWSLETTER_TOPICS)[number]["id"][],
  ]
);

export const subscribeBodySchema = z.object({
  email: z.string().trim().email(),
  name: z.preprocess(
    (val) => {
      if (val == null || val === "") return undefined;
      const s = String(val).trim();
      return s === "" ? undefined : s;
    },
    z.union([z.undefined(), z.string().min(1).max(80)])
  ),
  topics: z.array(topicIdSchema).min(1),
  consent: z.literal(true),
});

export type SubscribeBody = z.infer<typeof subscribeBodySchema>;

export const sendBodySchema = z.object({
  topic: topicIdSchema,
  subject: z.string().trim().min(1).max(200),
  html: z.string().trim().min(1),
  previewText: z.string().trim().max(500).optional(),
  dryRun: z.boolean().optional(),
});

export type SendBody = z.infer<typeof sendBodySchema>;
