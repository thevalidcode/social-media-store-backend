"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addService = exports.getServicesByProviderId = exports.deleteMultipleService = exports.deleteService = exports.updateService = exports.getServiceByIDFromAdmin = exports.getServiceByID = exports.getServicesForAdmins = exports.getServices = void 0;
const zod_1 = require("zod");
const crud_1 = require("../crud");
const user_schema_1 = require("../schemas/user.schema");
const service_schema_1 = require("../schemas/service.schema");
const getServicesSchema = zod_1.z.object({
    panel_id: zod_1.z.coerce.number(),
});
const serviceIdSchema = zod_1.z.object({
    service_id: zod_1.z.coerce.number(),
    panel_id: zod_1.z.coerce.number(),
});
const getServices = async (req, res) => {
    const parsed = getServicesSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id } = parsed.data;
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id, {
            filter: { field: "status", operator: "===", value: "active" },
            removeKeys: [
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
const getServicesForAdmins = async (req, res) => {
    const parsed = user_schema_1.AuthSchema.safeParse(req.auth);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id, role } = parsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id);
        const sortedServices = services.sort((a, b) => a.position - b.position);
        res.status(200).json(sortedServices);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getServicesForAdmins = getServicesForAdmins;
const getServiceByID = async (req, res) => {
    const parsed = serviceIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id, service_id } = parsed.data;
    try {
        const service = await (0, crud_1.getDocs)("services", panel_id, {
            find: { field: "id", operator: "===", value: service_id },
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
const getServiceByIDFromAdmin = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = serviceIdSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { service_id } = parsed.data;
    const { panel_id, role } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const service = await (0, crud_1.getDocs)("services", panel_id, {
            find: { field: "id", operator: "===", value: service_id },
        });
        res.status(200).json({ service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getServiceByIDFromAdmin = getServiceByIDFromAdmin;
const updateService = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = service_schema_1.ServiceUpdateInputSchema.safeParse(req.body);
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
        await (0, crud_1.updatePanelDoc)("services", reqData.uid, reqData, panel_id);
        const service = await (0, crud_1.getDocs)("services", panel_id, {
            find: { field: "uid", operator: "===", value: reqData.uid },
        });
        res.status(200).json({ success: "Service updated successfully.", service });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = service_schema_1.DeleteServiceInputSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    const { role, panel_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDoc)("services", uid, panel_id);
        res.status(200).json({ success: "Service deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteService = deleteService;
const deleteMultipleService = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = service_schema_1.DeleteMultipleServicesInputSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { uids } = parsed.data;
    const { role, panel_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDocs)("services", uids, panel_id);
        res.status(200).json({ success: "Services deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteMultipleService = deleteMultipleService;
const getServicesByProviderId = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = zod_1.z
        .object({
        provider_id: zod_1.z.coerce.number(),
    })
        .safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { provider_id } = parsed.data;
    const { role, panel_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id, {
            filter: { field: "provider_id", operator: "===", value: provider_id },
        });
        res.status(200).json({ services });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getServicesByProviderId = getServicesByProviderId;
const addService = async (req, res) => {
    const authParsed = user_schema_1.AuthSchema.safeParse(req.auth);
    const parsed = service_schema_1.ServiceCreateInputSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    if (!authParsed.success) {
        res.status(400).json({ error: authParsed.error.flatten() });
        return;
    }
    const { role, panel_id } = authParsed.data;
    if (role === "user") {
        res.status(403).json({ error: "Unauthorised User." });
        return;
    }
    try {
        const services = await (0, crud_1.getDocs)("services", panel_id);
        const newId = services.reduce((max, s) => Math.max(max, s.id), 0) + 1;
        const serviceData = {
            ...parsed.data,
            position: newId,
            panel_id,
            status: "active",
        };
        await (0, crud_1.addPanelDoc)("services", serviceData, panel_id);
        res.status(200).json({
            success: "Service added successfully.",
            service: serviceData,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addService = addService;
