"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncServices = exports.updateExistingServices = void 0;
const crud_1 = require("../crud");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const emails_1 = require("../emails");
const db_1 = require("../config/db");
const encrypt_1 = require("../utils/encrypt");
const agent = new https_1.default.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
});
const safeFloat = (n, d = 0) => Number.isFinite(+n) ? parseFloat(n) : d;
const safeInt = (n, d = 0) => Number.isFinite(+n) ? parseInt(n, 10) : d;
const updateExistingServices = async () => {
    try {
        const panelIds = (await db_1.pool.query(`SELECT DISTINCT panel_id FROM services`)).rows.map((r) => r.panel_id);
        for (const panel_id of panelIds) {
            const services = await (0, crud_1.getDocs)("services", panel_id);
            const providers = await (0, crud_1.getDocs)("providers", panel_id);
            const provCache = {};
            for (const svc of services) {
                const prov = providers.find((p) => p.url === svc.provider);
                if (!prov)
                    continue;
                if (!provCache[prov.url]) {
                    const decryptedKey = (0, encrypt_1.decryptKey)(prov.key.encrypted_key, prov.key.iv);
                    const baseURL = `${prov.url}`;
                    const [balanceRes, servicesRes] = await Promise.all([
                        axios_1.default.post(baseURL, { action: "balance", key: decryptedKey }, { httpsAgent: agent }),
                        axios_1.default.post(baseURL, { action: "services", key: decryptedKey }, { httpsAgent: agent }),
                    ]);
                    provCache[prov.url] = {
                        currency: balanceRes.data.currency.toUpperCase(),
                        list: servicesRes.data,
                    };
                }
                const { currency: provCur, list } = provCache[prov.url];
                const liveSvc = list.find((x) => String(x.service) === String(svc.provider_id));
                if (!liveSvc) {
                    await (0, crud_1.updatePanelDoc)("services", svc.uid, { status: "disabled" }, panel_id);
                    continue;
                }
                const calcPrice = safeFloat(liveSvc.rate) +
                    (safeFloat(liveSvc.rate) * svc.percentage) / 100;
                const priceUSD = safeFloat(calcPrice).toFixed(3);
                await (0, crud_1.updatePanelDoc)("services", svc.uid, {
                    type: liveSvc.type,
                    provider_price: safeFloat(liveSvc.rate),
                    price: safeFloat(priceUSD),
                    cancel: liveSvc.cancel,
                    provider_currency: provCur,
                    network: liveSvc.network || "None",
                    refill: liveSvc.refill,
                }, panel_id);
                if (liveSvc.description) {
                    await (0, crud_1.updatePanelDoc)("services", svc.uid, { description: liveSvc.description }, panel_id);
                }
                if (svc.sync_quantity) {
                    await (0, crud_1.updatePanelDoc)("services", svc.uid, {
                        min: safeInt(liveSvc.min),
                        max: safeInt(liveSvc.max),
                    }, panel_id);
                }
                if (svc.sync_cat_and_name) {
                    await (0, crud_1.updatePanelDoc)("services", svc.uid, {
                        name: liveSvc.name,
                        category: liveSvc.category,
                    }, panel_id);
                }
            }
        }
    }
    catch (err) {
        console.error("Error updating services:", err.message);
    }
};
exports.updateExistingServices = updateExistingServices;
const syncServices = async () => {
    try {
        const panels = await (0, crud_1.getDocs)("panels");
        for (const p of panels) {
            const panel_id = p.panel_id;
            const providers = (await (0, crud_1.getDocs)("providers", panel_id)).filter((pr) => pr.sync);
            if (!providers.length)
                continue;
            const services = await (0, crud_1.getDocs)("services", panel_id);
            const categories = await (0, crud_1.getDocs)("categories", panel_id);
            let maxId = services.reduce((m, s) => Math.max(m, s.id), 0);
            let categoryId = categories.length;
            for (const prov of providers) {
                const decryptedKey = (0, encrypt_1.decryptKey)(prov.key.encrypted_key, prov.key.iv);
                const baseURL = `${prov.url}`;
                const [{ data: balance }, { data: svcList }] = await Promise.all([
                    axios_1.default.post(baseURL, { action: "balance", key: decryptedKey }, { httpsAgent: agent }),
                    axios_1.default.post(baseURL, { action: "services", key: decryptedKey }, { httpsAgent: agent }),
                ]);
                const provCur = balance.currency.toUpperCase();
                for (const s of svcList) {
                    if (!categories.some((c) => c.name === s.category)) {
                        categoryId++;
                        await (0, crud_1.addPanelDoc)("categories", {
                            name: s.category,
                            status: "active",
                            position: categoryId,
                        }, panel_id);
                    }
                    const exists = services.find((x) => safeInt(x.provider_id) === safeInt(s.service));
                    if (exists)
                        continue;
                    maxId++;
                    const calcPrice = safeFloat(s.rate) + (safeFloat(s.rate) * prov.percentage) / 100;
                    const endPrice = safeFloat(calcPrice).toFixed(3);
                    const row = {
                        id: maxId,
                        name: s.name,
                        category: s.category,
                        type: s.type,
                        provider_currency: provCur,
                        min: safeInt(s.min),
                        max: safeInt(s.max),
                        provider_id: safeInt(s.service),
                        description: s.description || "",
                        provider_price: safeFloat(s.rate),
                        panel_id,
                        status: "active",
                        sync_quantity: true,
                        sync_cat_and_name: true,
                        price: safeFloat(endPrice),
                        position: maxId,
                        cancel: s.cancel,
                        network: s.network || "None",
                        refill: s.refill,
                        percentage: prov.percentage,
                        drip_feed: false,
                        provider: prov.url,
                    };
                    await (0, crud_1.addPanelDoc)("services", row, panel_id);
                    try {
                        await (0, emails_1.sendEmail)(undefined, "new_service", {
                            ...row,
                            provider_currency: row.provider_currency,
                            provider_price: row.provider_price,
                        }, panel_id);
                    }
                    catch (err) {
                        console.error(`Email error (panel ${panel_id}):`, err.message);
                    }
                }
            }
        }
    }
    catch (err) {
        console.error("Error syncing services:", err.message);
    }
};
exports.syncServices = syncServices;
