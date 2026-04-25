import { z } from "zod";

export const ResellerSourceStoresResponse = {
  description: "List of source providers available for reseller discovery",
  content: {
    "application/json": {
      schema: z.object({
        providers: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            url: z.string(),
            image: z.string().nullable(),
          }),
        ),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          pages: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const ResellerSourceServicesResponse = {
  description: "Catalog preview for a source provider",
  content: {
    "application/json": {
      schema: z.object({
        provider: z.object({
          providerId: z.string(),
          sourceUid: z.string(),
          name: z.string(),
          url: z.string(),
        }),
        services: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            price: z.union([z.string(), z.number()]),
            currency: z.string().nullable(),
            min: z.number(),
            max: z.number(),
          }),
        ),
      }),
    },
  },
};

export const ResellerImportServicesResponse = {
  description: "Services imported into target reseller store",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          providerId: z.string(),
          targetStoreId: z.number(),
          marginType: z.enum(["percentage", "fixed"]),
          marginValue: z.number(),
          totalSourceServices: z.number(),
          created: z.number(),
          updated: z.number(),
        }),
      }),
    },
  },
};

export const ResellerSyncServicesResponse = {
  description: "Services synchronized into target reseller store",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          providerId: z.string(),
          targetStoreId: z.number(),
          marginType: z.enum(["percentage", "fixed"]),
          marginValue: z.number(),
          totalSourceServices: z.number(),
          created: z.number(),
          updated: z.number(),
          syncedAt: z.string(),
        }),
      }),
    },
  },
};
