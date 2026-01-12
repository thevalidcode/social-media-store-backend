import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ServiceStatus, ServiceType } from "../../prisma/generated";

extendZodWithOpenApi(z);

const serviceType = z.nativeEnum(ServiceType);

const serviceStatus = z.nativeEnum(ServiceStatus);

export const ServiceSchema = z
  .object({
    storeScopedId: z.number(),
    uid: z.string(),
    name: z.string(),
    category: z.string(),
    currency: z.string(),
    type: serviceType,
    min: z.number(),
    max: z.number(),
    icon: z.string(),
    price: z.string(),
    providerPrice: z.string(),
    providerId: z.number(),
    description: z.string(),
    refillDays: z.number(),
    syncQuantity: z.boolean(),
    syncCatAndName: z.boolean(),
    dripFeed: z.boolean(),
    network: z.string(),
    refill: z.boolean(),
    cancel: z.boolean(),
    position: z.number(),
    status: serviceStatus,
    storeId: z.number(),
  })
  .openapi("Service");

export const ServicePublicSchema = z
  .object({
    storeScopedId: z.number(),
    name: z.string(),
    type: serviceType,
    currency: z.string(),
    min: z.number(),
    max: z.number(),
    price: z.number(),
    icon: z.string(),
    category: z.string(),
    description: z.string().optional(),
    network: z.string().optional(),
    dripFeed: z.boolean().optional(),
  })
  .openapi("ServicePublic");

export const ServiceCreateInputSchema = z.object({
  name: z.string(),
  category: z.string(),
  currency: z.string(),
  type: serviceType,
  min: z.number(),
  max: z.number(),
  price: z.string(),
  providerPrice: z.string().optional(),
  providerId: z.number().optional(),
  icon: z.string().optional().nullable(),
  description: z.string().optional(),
  position: z.number().optional(),
  refillDays: z.number().optional().nullable(),
  syncQuantity: z.boolean().optional(),
  syncWithProvider: z.boolean().optional().default(false),
  syncCatAndName: z.boolean().optional(),
  dripFeed: z.boolean().optional(),
  network: z.string().optional(),
  refill: z.boolean().optional(),
  cancel: z.boolean().optional(),
  providerUid: z.string().optional(),
});

export const ServiceUpdateInputSchema = z.object({
  uid: z.string(),
  name: z.string().optional(),
  type: serviceType,
  status: serviceStatus.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  refillDays: z.number().optional(),
  syncQuantity: z.boolean().optional(),
  icon: z.string().optional(),
  syncCatAndName: z.boolean().optional(),
  dripFeed: z.boolean().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  position: z.number().optional(),
});

export const DeleteServiceInputSchema = z.object({
  uid: z.string(),
});

export const DeleteMultipleServicesInputSchema = z.object({
  uids: z.array(z.string()),
});
