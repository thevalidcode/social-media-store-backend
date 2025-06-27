"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = exports.CurrentAdminResponse = exports.CurrentUserResponse = exports.ExchangeRatesResponse = exports.SiteDataResponse = exports.DesignStylesResponse = exports.PanelDataResponse = void 0;
const panel_schema_1 = require("../../schemas/panel.schema");
const user_schema_1 = require("../../schemas/user.schema");
const zod_1 = require("zod");
exports.PanelDataResponse = {
    description: "Panel Data lookup result",
    content: {
        "application/json": {
            schema: panel_schema_1.PanelDataSchema,
        },
    },
};
exports.DesignStylesResponse = {
    description: "Design styles configuration",
    content: {
        "application/json": {
            schema: panel_schema_1.DesignStylesSchema,
        },
    },
};
exports.SiteDataResponse = {
    description: "General site data",
    content: {
        "application/json": {
            schema: panel_schema_1.SiteDataSchema,
        },
    },
};
exports.ExchangeRatesResponse = {
    description: "Latest currency exchange rates",
    content: {
        "application/json": {
            schema: panel_schema_1.ExchangeRatesSchema,
        },
    },
};
exports.CurrentUserResponse = {
    description: "Current user record",
    content: {
        "application/json": {
            schema: user_schema_1.UserPublicSchema,
        },
    },
};
exports.CurrentAdminResponse = {
    description: "Current admin record",
    content: {
        "application/json": {
            schema: user_schema_1.AdminPublicSchema,
        },
    },
};
exports.NotFound = {
    description: "Resource not found",
    content: {
        "application/json": {
            schema: zod_1.z.object({
                error: zod_1.z.string().describe("Error message"),
            }),
        },
    },
};
