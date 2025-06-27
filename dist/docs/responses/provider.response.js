"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successWithProvider = exports.ProviderServicesListResponse = exports.ProviderListResponse = void 0;
const provider_schema_1 = require("../../schemas/provider.schema");
const zod_1 = require("zod");
exports.ProviderListResponse = {
    description: "List of all providers",
    content: {
        "application/json": {
            schema: zod_1.z.array(provider_schema_1.ProviderSchema),
        },
    },
};
exports.ProviderServicesListResponse = {
    description: "List of all provider's services",
    content: {
        "application/json": {
            schema: zod_1.z.array(provider_schema_1.ProviderServiceSchema),
        },
    },
};
exports.successWithProvider = {
    description: "Provider updated successfully",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                success: zod_1.z.literal("Provider updated successfully."),
                provider: provider_schema_1.ProviderSchema,
            }),
        },
    },
};
