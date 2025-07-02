"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const index_paths_1 = require("./paths/index.paths");
const version_1 = require("../version");
const swaggerRouter = (0, express_1.Router)();
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin)
        return next();
    res.status(401).send("Unauthorized. Admin login required.");
}
const generator = new zod_to_openapi_1.OpenApiGeneratorV3(index_paths_1.registry.definitions);
const openApiDocument = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "Valid Panel - Social Media Store API Documentation",
        version: version_1.API_VERSION,
        description: "Comprehensive API documentation for the Social Media Store feature of Valid Panel, covering all user and admin endpoints related to service ordering, wallet operations, referrals, authentication, and store management.",
        contact: {
            name: "Valid Code",
            url: "https://linkedin.com/in/thevalidcode",
            email: "thevalidcode@gmail.com",
        },
    },
    servers: [
        {
            url: "https://validpanel.com:6060",
            description: "Public testing server (use this to test endpoints)",
        },
        {
            url: "https://auth.validpanel.com/api/auth/panel",
            description: "Public server (use this for auth endpoints)",
        },
        {
            url: "https://{domain}:6060",
            description: "Custom panel domain (replace `{domain}` with your own)",
            variables: {
                domain: {
                    default: "yourdomain.com",
                    description: "Your custom panel domain (e.g. `myreseller.com`)",
                },
            },
        },
        {
            url: "http://localhost:6060",
            description: "Local development server",
        },
    ],
});
swaggerRouter.use("/admin/docs", isAdmin, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openApiDocument, {
    customCssUrl: "/assets/swagger-custom.css",
    customfavIcon: "/assets/validpanel-removedbg.png",
    customSiteTitle: "Social Media Store API Docs",
}));
exports.default = swaggerRouter;
