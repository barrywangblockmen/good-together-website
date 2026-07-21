import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const whitelistRoleSchema = z.enum(["member", "admin"]);

export type WhitelistRole = z.infer<typeof whitelistRoleSchema>;

export const addWhitelistBodySchema = z.object({
  email: z.string().trim().email(),
  role: whitelistRoleSchema.default("member"),
});

export type AddWhitelistBody = z.infer<typeof addWhitelistBodySchema>;

export const removeWhitelistBodySchema = z.object({
  email: z.string().trim().email(),
});

export type RemoveWhitelistBody = z.infer<typeof removeWhitelistBodySchema>;
