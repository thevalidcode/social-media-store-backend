import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const StoreIdSchema = z.object({
  storeId: z.coerce.number(),
});

export const UidSchema = z.object({
  uid: z.string(),
});
