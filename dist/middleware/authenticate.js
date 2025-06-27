"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crud_1 = require("../crud");
const env_1 = require("../config/env");
const zod_1 = require("zod");
// Zod schema for verifying JWT payload
const tokenPayloadSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    panel_id: zod_1.z.number(),
    api_key: zod_1.z.string(),
});
// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        res.status(401).json({ error: "No token" });
        return;
    }
    const token = header.slice(7).trim();
    if (!token) {
        res.status(401).json({ error: "No token" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET || "");
        const parsed = tokenPayloadSchema.safeParse(decoded);
        if (!parsed.success) {
            res.status(401).json({ error: "Invalid token payload" });
            return;
        }
        const { email, panel_id, api_key } = parsed.data;
        const user = await (0, crud_1.getDocs)("users", panel_id, { find: { email } });
        const admin = await (0, crud_1.getDocs)("admins", panel_id, { find: { email } });
        const keyMatches = (user && user.api_key === api_key) ||
            (admin && admin.api_key === api_key);
        if (!keyMatches) {
            res.status(401).json({ error: "Key mismatch" });
            return;
        }
        req.auth = {
            email,
            panel_id,
            api_key,
            role: admin ? admin.role || "admin" : "user",
            user: admin || user,
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.authenticate = authenticate;
