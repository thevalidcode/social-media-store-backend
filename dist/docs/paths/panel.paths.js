"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const panel_response_1 = require("../responses/panel.response");
const common_response_1 = require("../responses/common.response");
// GET /panel/data
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/data",
    summary: "Get the panel data for a custom domain",
    tags: ["Panel"],
    parameters: [
        {
            name: "domain",
            in: "query",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: panel_response_1.PanelDataResponse,
        404: panel_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
// GET /panel/styles
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/styles",
    summary: "Get design styles for a panel",
    tags: ["Panel"],
    parameters: [
        {
            name: "panel_id",
            in: "query",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: panel_response_1.DesignStylesResponse,
        500: common_response_1.ServerError,
    },
});
// GET /panel/site-data
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/site-data",
    summary: "Get general site data for a panel",
    tags: ["Panel"],
    parameters: [
        {
            name: "panel_id",
            in: "query",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: panel_response_1.SiteDataResponse,
        500: common_response_1.ServerError,
    },
});
// GET /panel/rates
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/rates",
    summary: "Get latest exchange rates",
    tags: ["Panel"],
    responses: {
        200: panel_response_1.ExchangeRatesResponse,
        500: common_response_1.ServerError,
    },
});
// GET /panel/current-user
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/current-user",
    summary: "Get the currently authenticated user",
    tags: ["Panel"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "uid",
            in: "query",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: panel_response_1.CurrentUserResponse,
        404: panel_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
// GET /panel/current-admin
registry_1.registry.registerPath({
    method: "get",
    path: "/panel/current-admin",
    summary: "Get the currently authenticated admin",
    tags: ["Panel"],
    security: [{ CookieAuth: [] }],
    parameters: [
        {
            name: "uid",
            in: "query",
            required: true,
            schema: { type: "string" },
        },
    ],
    responses: {
        200: panel_response_1.CurrentAdminResponse,
        403: common_response_1.Forbidden,
        404: panel_response_1.NotFound,
        500: common_response_1.ServerError,
    },
});
