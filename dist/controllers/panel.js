"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAdmin = exports.getCurrentUser = exports.getRates = exports.getSiteData = exports.getStyles = exports.getPanelData = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const panelIdQuerySchema = zod_1.z.object({ domain: zod_1.z.string().min(1) });
const panelIdSchema = zod_1.z.object({ panel_id: zod_1.z.coerce.number() });
const uidQuerySchema = zod_1.z.object({ uid: zod_1.z.string().min(1) });
const getPanelData = async (req, res) => {
    const parsed = panelIdQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { domain } = parsed.data;
    try {
        const panels = await (0, crud_1.getDocs)("panels");
        const panel = panels.find((p) => p.uid === domain);
        if (!panel) {
            res.status(404).json({ error: "Panel not found for the given domain" });
            return;
        }
        res.json({
            panel_id: panel.panel_id,
            plan: panel.plan,
            timestamp: panel.timestamp,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getPanelData = getPanelData;
const getStyles = async (req, res) => {
    const parsed = panelIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("design_styles", panel_id);
        res.json(result[0]);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getStyles = getStyles;
const getSiteData = async (req, res) => {
    const parsed = panelIdSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("general", panel_id, {
            find: { field: "uid", operator: "==", value: "site" },
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getSiteData = getSiteData;
const getRates = async (_req, res) => {
    try {
        const result = await (0, crud_1.getDocs)("currencies", 1);
        res.json(result[0].quotes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getRates = getRates;
const getCurrentUser = async (req, res) => {
    if (!req.auth) {
        res.status(401).json({ error: "Unauthorized: auth info missing" });
        return;
    }
    const { panel_id } = req.auth;
    const parsed = uidQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("users", panel_id, {
            find: { field: "uid", operator: "==", value: uid },
            removeKeys: ["password"],
        });
        if (!result) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCurrentUser = getCurrentUser;
const getCurrentAdmin = async (req, res) => {
    if (!req.auth) {
        res.status(401).json({ error: "Unauthorized: auth info missing" });
        return;
    }
    const { panel_id, role } = req.auth;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    const parsed = uidQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    try {
        const result = await (0, crud_1.getDocs)("admins", panel_id, {
            find: { field: "uid", operator: "==", value: uid },
            removeKeys: ["password"],
        });
        if (!result) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCurrentAdmin = getCurrentAdmin;
