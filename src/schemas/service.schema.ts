import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const serviceType = z.enum([
  "Default",
  "Custom Comments",
  "Package",
  "Subscription",
]);

const serviceStatus = z.enum(["active", "disabled"]);

export const ServiceSchema = z
  .object({
    id: z.number(),
    uid: z.string(),
    name: z.string(),
    category: z.string(),
    type: serviceType,
    min: z.number(),
    max: z.number(),
    price: z.number(),
    provider_price: z.number(),
    provider_id: z.number(),
    description: z.string(),
    refill_days: z.number(),
    sync_quantity: z.boolean(),
    sync_cat_and_name: z.boolean(),
    drip_feed: z.boolean(),
    network: z.string(),
    refill: z.boolean(),
    cancel: z.boolean(),
    position: z.number(),
    status: serviceStatus,
    store_id: z.number(),
  })
  .openapi("Service");

export const ServicePublicSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    type: serviceType,
    min: z.number(),
    max: z.number(),
    price: z.number(),
    category: z.string(),
    description: z.string().optional(),
    network: z.string().optional(),
    drip_feed: z.boolean().optional(),
  })
  .openapi("ServicePublic");

export const ServiceCreateInputSchema = z.object({
  name: z.string(),
  category: z.string(),
  type: serviceType,
  min: z.number(),
  max: z.number(),
  price: z.number(),
  provider_price: z.number().optional(),
  provider_id: z.number().optional(),
  description: z.string().optional(),
  position: z.number().optional(),
  refill_days: z.number().optional(),
  sync_quantity: z.boolean().optional(),
  sync_cat_and_name: z.boolean().optional(),
  drip_feed: z.boolean().optional(),
  network: z.string().optional(),
  refill: z.boolean().optional(),
  cancel: z.boolean().optional(),
});

export const ServiceUpdateInputSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  type: serviceType,
  status: serviceStatus.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  refill_days: z.number().optional(),
  sync_quantity: z.boolean().optional(),
  sync_cat_and_name: z.boolean().optional(),
  drip_feed: z.boolean().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  position: z.number().optional(),
});

export const DeleteServiceInputSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleServicesInputSchema = z.object({
  uids: z.array(z.string()),
});
