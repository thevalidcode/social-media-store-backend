"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefillStatus = exports.sendRefillToMainServer = void 0;
const crud_1 = require("../crud");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const emails_1 = require("../emails");
const encrypt_1 = require("../utils/encrypt");
const agent = new https_1.default.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
});
const safeInt = (n, d = 0) => Number.isFinite(+n) ? parseInt(n, 10) : d;
const sendRefillToMainServer = async (order_uid, panel_id) => {
    try {
        const order = await (0, crud_1.getDocs)("orders", panel_id, {
            find: { field: "uid", operator: "===", value: order_uid },
        });
        const prov = await (0, crud_1.getDocs)("providers", panel_id, {
            find: { field: "url", operator: "===", value: order.provider },
        });
        if (!order || !prov)
            return false;
        const url = `${order.provider}`;
        const decryptedKey = (0, encrypt_1.decryptKey)(prov.key.encrypted_key, prov.key.iv);
        const { data: res } = await axios_1.default.post(url, { key: decryptedKey, action: "refill", order: order.provider_order_id }, { httpsAgent: agent });
        if (res.error) {
            try {
                await (0, emails_1.sendEmail)(undefined, "new_failed_refill", {
                    order_id: order.id,
                    quantity: order.quantity,
                    price: order.price,
                    provider: order.provider,
                    error: res.error,
                }, panel_id);
            }
            catch (e) {
                console.error("Email error (failed refill):", e.message);
            }
            return false;
        }
        const refillRow = await (0, crud_1.addPanelDoc)("refills", {
            provider_id: safeInt(res.refill),
            provider: order.provider,
            url: order.url,
            order_id: order.id,
        }, panel_id);
        await (0, exports.updateRefillStatus)(refillRow.uid, panel_id);
        try {
            await (0, emails_1.sendEmail)(undefined, "new_refill", {
                order_id: order.id,
                username: order.username,
                number: order.number,
                price: order.price,
                provider: order.provider,
            }, panel_id);
        }
        catch (e) {
            console.error("Email error (new refill):", e.message);
        }
        return true;
    }
    catch (err) {
        console.error("Error sending refill to main server:", err.message);
        return false;
    }
};
exports.sendRefillToMainServer = sendRefillToMainServer;
const updateRefillStatus = async (refill_uid, panel_id) => {
    try {
        const refill = (await (0, crud_1.getDocs)("refills", panel_id)).find((r) => r.uid === refill_uid);
        const provider = (await (0, crud_1.getDocs)("providers", panel_id)).find((p) => p.url === refill.provider);
        if (!refill || !provider)
            return false;
        const url = `${refill.provider}`;
        const decryptedKey = (0, encrypt_1.decryptKey)(provider.key.encrypted_key, provider.key.iv);
        const { data: res } = await axios_1.default.post(url, {
            key: decryptedKey,
            action: "refill_status",
            refill: refill.provider_id,
        }, { httpsAgent: agent });
        if (res.error) {
            await (0, crud_1.updatePanelDoc)("refills", refill_uid, { provider_error: res.error }, panel_id);
            return false;
        }
        await (0, crud_1.updatePanelDoc)("refills", refill_uid, { status: res.status }, panel_id);
        return true;
    }
    catch (err) {
        console.error("Error updating refill:", err.message);
        return false;
    }
};
exports.updateRefillStatus = updateRefillStatus;
