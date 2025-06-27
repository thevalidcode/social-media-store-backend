"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../components/registry");
const zod_1 = require("zod");
registry_1.registry.registerPath({
    method: "get",
    path: "/login/google",
    summary: "Redirect user to Google OAuth login",
    description: "Initiates Google OAuth login by redirecting the user. Expects a redirect URI and panel ID. Upon success, redirects back with a token and email in the query string.",
    tags: ["Auth"],
    parameters: [
        {
            name: "redirect",
            in: "query",
            required: true,
            description: "URL to redirect back to after successful login",
            schema: {
                type: "string",
                format: "uri",
            },
        },
        {
            name: "panel_id",
            in: "query",
            required: true,
            description: "Numeric panel ID",
            schema: {
                type: "integer",
            },
        },
    ],
    responses: {
        302: {
            description: "Redirects to the provided redirect URL with the access token and email in query params.\n\nExample: https://your-app.com/dashboard?token=abc123&email=user@example.com",
            headers: {
                Location: {
                    description: "Redirect URL with token and email query parameters",
                    schema: {
                        type: "string",
                        format: "uri",
                    },
                },
            },
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        token: zod_1.z.string(),
                        user: zod_1.z.object({
                            id: zod_1.z.string(),
                            email: zod_1.z.string().email(),
                        }),
                    }),
                },
            },
        },
        400: {
            description: "Bad Request",
            content: {
                "application/json": {
                    schema: zod_1.z.object({
                        error: zod_1.z.string(),
                    }),
                },
            },
        },
    },
});
