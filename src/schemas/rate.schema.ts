import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const RateSchema = z.record(z.string(), z.number()).openapi("Rate");
