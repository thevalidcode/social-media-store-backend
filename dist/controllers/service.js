"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceByID = exports.importServices = exports.getServices = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const uuid_1 = require("uuid");
const axios_1 = __importDefault(require("axios"));
const checkapikey_1 = require("../utils/checkapikey");
const panelIdKeySchema = zod_1.z.object({
    panel_id: zod_1.z.coerce.number(),
    key: zod_1.z.string().min(1),
});
const serviceIdSchema = zod_1.z.object({
    panel_id: zod_1.z.coerce.number(),
    key: zod_1.z.string().min(1),
    service_id: zod_1.z.coerce.number(),
});
const importServiceSchema = zod_1.z.object({
    providerServicesId: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])),
    importPercent: zod_1.z.number(),
    categoryOption: zod_1.z.object({ value: zod_1.z.string(), label: zod_1.z.string() }),
    providerOption: zod_1.z.object({
        value: zod_1.z.string(),
        label: zod_1.z.string(),
        key: zod_1.z.string(),
    }),
});
const getServices = async (req, res) => {
    const parsed = panelIdKeySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id, key } = parsed.data;
    const adminExist = await (0, checkapikey_1.checkAdminApiKey)(key, panel_id);
    if (adminExist.error) {
        res.status(401).json({ error: "Invalid Key" });
        return;
    }
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id, {
            filter: { field: "status", operator: "==", value: "active" },
            removeKeys: adminExist
                ? []
                : [
                    "sync_quantity",
                    "sync_cat_and_name",
                    "provider",
                    "percentage",
                    "status",
                    "panel_id",
                    "provider_id",
                    "uid",
                    "provider_price",
                ],
        });
        const sortedServices = services.sort((a, b) => a.position - b.position);
        res.status(200).json(sortedServices);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getServices = getServices;
const importServices = async (req, res) => {
    const bodyParsed = importServiceSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        res.status(400).json({ error: bodyParsed.error.flatten() });
        return;
    }
    const { providerServicesId, importPercent, categoryOption, providerOption } = bodyParsed.data;
    const { role, panel_id } = req.auth;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id);
        let maxId = services.reduce((max, svc) => Math.max(max, svc.id), 0);
        const categories = await (0, crud_1.getDocs)("categories", panel_id);
        let categoryId = categories.length;
        const provcResponse = await axios_1.default.post(`https://${providerOption.value}/api/v2`, {
            action: "balance",
            key: providerOption.key,
        });
        const provider_currency = provcResponse.data.currency.toUpperCase();
        const providerResponse = await axios_1.default.post(`https://${providerOption.value}/api/v2`, {
            action: "services",
            key: providerOption.key,
        });
        const providerServices = providerResponse.data;
        for (const selId of providerServicesId) {
            maxId++;
            categoryId++;
            const service = providerServices.find((serv) => parseInt(serv.service) === parseInt(selId));
            if (!service)
                continue;
            const calculatePrice = parseFloat(service.rate) +
                (parseFloat(service.rate) * importPercent) / 100;
            const endPrice = parseFloat(calculatePrice.toFixed(3));
            if (categoryOption.value === "createSameCategory") {
                const currentCategories = await (0, crud_1.getDocs)("categories", panel_id);
                const existingCategory = currentCategories.find((cat) => cat.name === service.category);
                if (!existingCategory) {
                    const categoryData = {
                        id: categoryId,
                        name: service.category,
                        timestamp: new Date(),
                        status: "active",
                        position: categoryId,
                        uid: (0, uuid_1.v4)(),
                    };
                    await (0, crud_1.addPanelDoc)("categories", categoryData, panel_id);
                }
            }
            const existingService = services.find((svc) => svc.provider_id === parseInt(service.service));
            if (!existingService) {
                const serviceData = {
                    id: maxId,
                    name: service.name,
                    category: categoryOption.value === "createSameCategory"
                        ? service.category
                        : categoryOption.label,
                    type: service.type,
                    min: parseInt(service.min),
                    max: parseInt(service.max),
                    provider_id: parseInt(service.service),
                    description: service.description || "",
                    provider_price: parseFloat(service.rate),
                    panel_id,
                    timestamp: new Date(),
                    status: "active",
                    sync_quantity: true,
                    sync_cat_and_name: true,
                    price: endPrice,
                    position: maxId,
                    cancel: service.cancel,
                    network: service.network || "None",
                    refill: service.refill,
                    percentage: importPercent,
                    drip_feed: false,
                    provider: providerOption.label,
                    provider_currency,
                    uid: (0, uuid_1.v4)(),
                };
                await (0, crud_1.addPanelDoc)("services", serviceData, panel_id);
            }
        }
        res.status(200).send("Services imported successfully");
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.importServices = importServices;
const getServiceByID = async (req, res) => {
    const parsed = serviceIdSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id, key, service_id } = parsed.data;
    const response = await (0, checkapikey_1.checkKey)(key, panel_id);
    if (response.error) {
        res.status(401).json({ error: "Invalid API key" });
        return;
    }
    try {
        const service = await (0, crud_1.getDocs)("services", panel_id, {
            find: { field: "id", operator: "==", value: service_id },
            removeKeys: [
                "provider_id",
                "provider_price",
                "percentage",
                "provider",
                "sync_cat_and_name",
                "sync_quantity",
                "panel_id",
                "status",
                "position",
            ],
        });
        res.status(200).json({ service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getServiceByID = getServiceByID;
