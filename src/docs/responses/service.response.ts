import { z } from "zod";
import {
  ServiceSchema,
  ServicePublicSchema,
} from "../../schemas/service.schema";

export const ServicePublicListResponse = {
  description: "List of available services (public users)",
  content: {
    "application/json": {
      schema: z.array(ServicePublicSchema),
    },
  },
};

export const ServiceListResponse = {
  description: "List of available services (admin)",
  content: {
    "application/json": {
      schema: z.array(ServiceSchema),
    },
  },
};

export const SingleServiceResponse = {
  description: "A single service object",
  content: {
    "application/json": {
      schema: z.object({
        service: ServiceSchema,
      }),
    },
  },
};

export const SingleServicePublicResponse = {
  description: "A single service object",
  content: {
    "application/json": {
      schema: z.object({
        service: ServicePublicSchema,
      }),
    },
  },
};

export const ServiceCreated = {
  description: "Service created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Service added successfully."),
        service: ServiceSchema,
      }),
    },
  },
};

export const ServiceDeleted = {
  description: "Service deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Service deleted successfully."),
      }),
    },
  },
};

export const ServicesDeleted = {
  description: "Multiple services deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Services deleted successfully."),
      }),
    },
  },
};

export const ServiceUpdated = {
  description: "Service updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Service updated successfully."),
        service: ServiceSchema,
      }),
    },
  },
};
