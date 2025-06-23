"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslOptions = void 0;
exports.SNICallback = SNICallback;
const fs_1 = __importDefault(require("fs"));
const tls_1 = __importDefault(require("tls"));
const crud_1 = require("../crud");
const env_1 = require("./env");
const env = env_1.env.NODE_ENV;
const sslOptions = {};
exports.sslOptions = sslOptions;
async function loadCertificates() {
    const domains = await (0, crud_1.getDocs)("registered_panels", null, {
        filter: { field: "ssl", operator: "===", value: true },
    });
    domains
        .filter((domain) => domain.uid !== "localhost:5173" && domain.uid !== "localhost:3000")
        .forEach((domain) => {
        if (env === "production") {
            sslOptions[domain.uid] = {
                cert: fs_1.default.readFileSync(`/etc/letsencrypt/live/${domain.uid}/fullchain.pem`),
                key: fs_1.default.readFileSync(`/etc/letsencrypt/live/${domain.uid}/privkey.pem`),
            };
        }
    });
}
async function SNICallback(domain, cb) {
    if (domain === "localhost:5173" || domain === "localhost:3000") {
        return cb(new Error("SSL certificate not available for localhost"));
    }
    let ctx = sslOptions[domain];
    if (!ctx) {
        const result = await (0, crud_1.getDocs)("registered_panels", null, {
            find: { field: "uid", operator: "===", value: domain },
        });
        const newDomain = Array.isArray(result) ? result[0] : result;
        if (newDomain?.ssl) {
            ctx = {
                cert: fs_1.default.readFileSync(`/etc/letsencrypt/live/${domain}/fullchain.pem`),
                key: fs_1.default.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`),
            };
            sslOptions[domain] = ctx;
        }
    }
    if (ctx) {
        cb(null, tls_1.default.createSecureContext(ctx));
    }
    else {
        cb(new Error(`No SSL certificate available for domain: ${domain}`));
    }
}
// Preload certificates at startup
loadCertificates();
