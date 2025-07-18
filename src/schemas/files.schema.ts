import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const UploadImageRequest = z.object({
  collection: z
    .enum(["blogs", "faqs", "general", "services", "categories", "users"])
    .describe("Collection of the image uploaded"),
});

export const UploadImageResponse = z.object({
  url: z
    .string()
    .url()
    .describe(
      "URL of the image (e.g https://validpanel.com/assets/1/users/image.png)"
    ),
  message: z.string().describe("Success message"),
});

export const FileSchema = z.object({
  originalname: z.string().min(1),
  mimetype: z.string().regex(/^image\/(jpeg|png|gif|webp)$/),
  size: z.number().max(5 * 1024 * 1024), // Max 5MB
});
