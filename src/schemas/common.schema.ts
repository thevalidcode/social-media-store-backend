import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const StoreIdSchema = z.object({
  store_id: z.coerce.number(),
});
