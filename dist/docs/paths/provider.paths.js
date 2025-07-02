"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const provider_schema_1 = require("../../schemas/provider.schema");
const common_response_1 = require("../responses/common.response");
const provider_response_1 = require("../responses/provider.response");
// POST /provider
registry_1.registry.registerPath({
    method: "post",
    path: "/provider",
    summary: "Add a new provider",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: provider_schema_1.ProviderCreateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// GET /provider
registry_1.registry.registerPath({
    method: "get",
    path: "/provider",
    summary: "Get all providers",
    tags: ["Providers"],
    responses: {
        200: provider_response_1.ProviderListResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// PATCH /provider
registry_1.registry.registerPath({
    method: "patch",
    path: "/provider",
    summary: "Update provider details",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: provider_schema_1.ProviderUpdateRequestSchema,
                },
            },
        },
    },
    responses: {
        200: provider_response_1.successWithProvider,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /provider
registry_1.registry.registerPath({
    method: "delete",
    path: "/provider",
    summary: "Delete a provider",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            uid: { type: "string" },
                        },
                        required: ["uid"],
                    },
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// DELETE /provider/multiple
registry_1.registry.registerPath({
    method: "delete",
    path: "/provider/multiple",
    summary: "Delete multiple providers",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            uids: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                        required: ["uids"],
                    },
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
// POST /provider/services/import
registry_1.registry.registerPath({
    method: "post",
    path: "/provider/services/import",
    summary: "Import provider services",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: provider_schema_1.ImportProviderServicesRequestSchema,
                },
            },
        },
    },
    responses: {
        200: common_response_1.SuccessResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
registry_1.registry.registerPath({
    method: "post",
    path: "/provider/services/",
    summary: "Get provider services",
    tags: ["Providers"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: provider_schema_1.ProviderServicesSchema,
                },
            },
        },
    },
    responses: {
        200: provider_response_1.ProviderServicesListResponse,
        400: common_response_1.BadRequest,
        403: common_response_1.Forbidden,
        500: common_response_1.ServerError,
    },
});
