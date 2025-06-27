"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleProviders = exports.deleteProvider = exports.updateProvider = exports.getProviders = exports.addProvider = exports.importServices = exports.getProviderServices = void 0;
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const crud_1 = require("../crud");
const encrypt_1 = require("../utils/encrypt");
const user_schema_1 = require("../schemas/user.schema");
const provider_schema_1 = require("../schemas/provider.schema");
const getProviderServices = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const bodyParsed = provider_schema_1.ProviderServicesSchema.safeParse(req.body);
    if (!authParsed.success || !bodyParsed.success) {
        res.status(400).json({
            error: {
                auth: !authParsed.success ? authParsed.error.flatten() : undefined,
                body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
            },
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    const { provider } = bodyParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const providerData = await (0, crud_1.getDocs)("providers", panel_id, {
            find: { url: provider },
        });
        if (!providerData) {
            res.status(404).json({ error: "Provider not found." });
            return;
        }
        const decryptedKey = (0, encrypt_1.decryptKey)(providerData.api_key.encrypted_key, providerData.api_key.iv);
        const providerResponse = await axios_1.default.post(`${provider}`, {
            action: "services",
            key: decryptedKey,
        });
        res.status(200).json(providerResponse.data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProviderServices = getProviderServices;
const importServices = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const bodyParsed = provider_schema_1.ImportProviderServicesRequestSchema.safeParse(req.body);
    if (!authParsed.success || !bodyParsed.success) {
        res.status(400).json({
            error: {
                auth: !authParsed.success ? authParsed.error.flatten() : undefined,
                body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
            },
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    const { provider_services_id, import_percent, category, provider } = bodyParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const [services, categories, providers] = await Promise.all([
            (0, crud_1.getDocs)("services", panel_id),
            (0, crud_1.getDocs)("categories", panel_id),
            (0, crud_1.getDocs)("providers", panel_id, { find: { url: provider } }),
        ]);
        const providerData = providers;
        const decryptedKey = (0, encrypt_1.decryptKey)(providerData.api_key.encrypted_key, providerData.api_key.iv);
        const [{ data: balanceData }, { data: providerServices }] = await Promise.all([
            axios_1.default.post(provider, { action: "balance", key: decryptedKey }),
            axios_1.default.post(provider, { action: "services", key: decryptedKey }),
        ]);
        const provider_currency = balanceData.currency.toUpperCase();
        let maxServiceId = services.reduce((max, svc) => Math.max(max, svc.id), 0);
        let categoryId = categories.length;
        for (const providerServiceId of provider_services_id) {
            const service = providerServices.find((s) => parseInt(s.service) === providerServiceId);
            if (!service)
                continue;
            const baseRate = parseFloat(service.rate);
            const finalPrice = parseFloat((baseRate + (baseRate * import_percent) / 100).toFixed(2));
            maxServiceId++;
            let serviceCategory = category.label;
            if (category.value === "createSameCategory") {
                const existingCategory = categories.find((c) => c.name === service.category);
                if (!existingCategory) {
                    categoryId++;
                    await (0, crud_1.addPanelDoc)("categories", {
                        name: service.category,
                        status: "active",
                        position: categoryId,
                    }, panel_id);
                }
                serviceCategory = service.category;
            }
            const alreadyExists = services.some((svc) => svc.provider_id === parseInt(service.service));
            if (alreadyExists)
                continue;
            await (0, crud_1.addPanelDoc)("services", {
                id: maxServiceId,
                name: service.name,
                category: serviceCategory,
                type: service.type,
                min: parseInt(service.min),
                max: parseInt(service.max),
                provider_id: parseInt(service.service),
                description: service.description || "",
                provider_price: baseRate,
                panel_id,
                status: "active",
                sync_quantity: true,
                sync_cat_and_name: true,
                price: finalPrice,
                position: maxServiceId,
                cancel: service.cancel,
                network: service.network || "None",
                refill: service.refill,
                percentage: import_percent,
                drip_feed: false,
                provider,
                provider_currency,
            }, panel_id);
        }
        res.status(200).send({ success: "Services imported successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.importServices = importServices;
const addProviderSchema = zod_1.z.object({
    percentage: zod_1.z.coerce.number(),
    name: zod_1.z.string(),
    api_key: zod_1.z.string().trim(),
    url: zod_1.z.string(),
    sync: zod_1.z.boolean(),
});
const addProvider = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const bodyParsed = addProviderSchema.safeParse(req.body);
    if (!authParsed.success || !bodyParsed.success) {
        res.status(400).json({
            error: {
                auth: !authParsed.success ? authParsed.error.flatten() : undefined,
                body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
            },
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    const reqData = bodyParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const encryptedKey = (0, encrypt_1.encryptKey)(reqData.api_key);
        const newProvider = {
            ...reqData,
            api_key: encryptedKey,
        };
        const existingProviders = await (0, crud_1.getDocs)("providers", panel_id, {
            find: { url: newProvider.url },
        });
        if (existingProviders) {
            res.status(400).json({ error: "Provider already exists." });
            return;
        }
        await (0, crud_1.addPanelDoc)("providers", newProvider, panel_id);
        res.status(200).json({ success: "Added Provider successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.addProvider = addProvider;
const getProviders = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
        res.status(400).json({
            error: !authParsed.success ? authParsed.error.flatten() : undefined,
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const providers = await (0, crud_1.getDocs)("providers", panel_id, {
            removeKeys: ["api_key"],
        });
        res.status(200).json({ providers });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getProviders = getProviders;
const updateProviderSchema = zod_1.z.object({
    percentage: zod_1.z.coerce.number().optional(),
    name: zod_1.z.string().optional(),
    api_key: zod_1.z.string().trim(),
    url: zod_1.z.string().optional(),
    sync: zod_1.z.boolean().optional(),
    uid: zod_1.z.string(),
});
const updateProvider = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = updateProviderSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const reqData = parsed.data;
    const { panel_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const key = (0, encrypt_1.encryptKey)(reqData.api_key);
        const newProvider = {
            ...reqData,
            api_key: key,
        };
        await (0, crud_1.updatePanelDoc)("providers", reqData.uid, newProvider, panel_id);
        const service = await (0, crud_1.getDocs)("providers", panel_id, {
            find: { uid: reqData.uid },
        });
        res
            .status(200)
            .json({ success: "Provider updated successfully.", service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProvider = updateProvider;
const deleteProviderSchema = zod_1.z.object({
    uid: zod_1.z.string(),
});
const deleteProvider = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = deleteProviderSchema.safeParse(req.body);
    if (!authParsed.success || !parsed.success) {
        res.status(400).json({
            error: {
                auth: !authParsed.success ? authParsed.error.flatten() : undefined,
                body: !parsed.success ? parsed.error.flatten() : undefined,
            },
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    const { uid } = parsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDoc)("providers", uid, panel_id);
        res.status(200).json({ success: "Provider deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteProvider = deleteProvider;
const deleteMultipleProviderSchema = zod_1.z.object({
    uids: zod_1.z.array(zod_1.z.string()),
});
const deleteMultipleProviders = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = deleteMultipleProviderSchema.safeParse(req.body);
    if (!authParsed.success || !parsed.success) {
        res.status(400).json({
            error: {
                auth: !authParsed.success ? authParsed.error.flatten() : undefined,
                body: !parsed.success ? parsed.error.flatten() : undefined,
            },
        });
        return;
    }
    const { panel_id, role } = authParsed.data;
    const { uids } = parsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDocs)("providers", uids, panel_id);
        res.status(200).json({ success: "Providers deleted successfully." });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteMultipleProviders = deleteMultipleProviders;
