import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const RoleEnum = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

export const RedirectToGoogleQuerySchema = z.object({
  redirect: z.string().url(),
  storeId: z.coerce.number(),
  role: RoleEnum.optional().default("USER"),
});

export const GoogleCallbackQuerySchema = z.object({
  code: z.coerce.string(),
  state: z.coerce.string(),
});

export type RedirectToGoogleQuery = z.infer<typeof RedirectToGoogleQuerySchema>;
export type GoogleCallbackQuery = z.infer<typeof GoogleCallbackQuerySchema>;

export default {
  RoleEnum,
  RedirectToGoogleQuerySchema,
  GoogleCallbackQuerySchema,
};
