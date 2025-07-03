"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDripFeedOrders = exports.syncAllPanelsOrderDetails = exports.syncOrderDetails = exports.sendUnsyncedOrders = exports.sendOrderToProvider = void 0;
const crud_1 = require("../crud");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const ConvertCurrency_1 = __importDefault(require("../utils/ConvertCurrency"));
const emails_1 = require("../emails");
const db_1 = require("../config/db");
const order_schema_1 = require("../schemas/order.schema");
const zod_1 = require("zod");
const encrypt_1 = require("../utils/encrypt");
const agent = new https_1.default.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
});
const currencies = async () => {
    const data = await (0, crud_1.getDocs)("currencies", 1);
    return data[0]?.quotes || { USD: 1 };
};
const safeFloat = (n, d = 0) => Number.isFinite(+n) ? parseFloat(n) : d;
const safeInt = (n, d = 0) => Number.isFinite(+n) ? parseInt(n, 10) : d;
const sendOrderToProvider = async (order, panel_id) => {
    try {
        const orderSchema = order_schema_1.placeOrderSchema.extend({ uid: zod_1.z.string().uuid() });
        const parsed = orderSchema.safeParse(order);
        if (!parsed.success)
            return { error: parsed.error.flatten() };
        const orderData = parsed.data;
        const [users, services, providers, affiliate_settings, rates] = await Promise.all([
            (0, crud_1.getDocs)("users", panel_id),
            (0, crud_1.getDocs)("services", panel_id),
            (0, crud_1.getDocs)("providers", panel_id),
            (0, crud_1.getDocs)("affiliate_settings", panel_id),
            currencies(),
        ]);
        const user = users.find((u) => u.uid === orderData.user_uid);
        const service = services.find((s) => s.uid === orderData.service_id);
        const provider = providers.find((p) => p.url === service.provider);
        if (!user || !service || !provider)
            return { error: "There's either no user, service or provider." };
        const pricePer1000 = (0, ConvertCurrency_1.default)(safeFloat(service.price), service.provider_currency, "USD", rates);
        let chargeUSD = 0;
        if (service.type === "Package") {
            chargeUSD = pricePer1000;
        }
        else {
            const quantity = safeFloat(orderData.quantity);
            chargeUSD = (quantity / 1000) * pricePer1000;
        }
        chargeUSD = parseFloat(chargeUSD.toFixed(2));
        const userBalance = safeFloat(user.balance);
        if (userBalance < chargeUSD) {
            return { error: "User has insufficient balance" };
        }
        const user_initial_balance = userBalance;
        const user_final_balance = userBalance - chargeUSD;
        await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: user_final_balance }, panel_id);
        // 🟡 Referral handling
        if (user.ref) {
            const affiliate = affiliate_settings[0];
            const refUser = users.find((u) => u.id === user.ref);
            const percent = affiliate.percent || 0;
            if (refUser) {
                const earned = parseFloat(((chargeUSD * percent) / 100).toFixed(2));
                const newRefBalance = safeFloat(refUser.balance) + earned;
                await (0, crud_1.updatePanelDoc)("users", refUser.uid, { balance: newRefBalance }, panel_id);
                await (0, crud_1.addPanelDoc)("referrals_orders", {
                    price: chargeUSD,
                    username: user.username,
                    ref_id: user.ref,
                }, panel_id);
                await (0, crud_1.addPanelDoc)("transactions", {
                    status: "success",
                    amount: earned,
                    currency: "USD",
                    payment_method: "Amount earned from your referral's order.",
                    user_id: user.uid,
                }, panel_id);
            }
        }
        // 🔒 Send to provider
        const decryptedKey = (0, encrypt_1.decryptKey)(provider.key.encrypted_key, provider.key.iv);
        const payload = {
            key: decryptedKey,
            action: "add",
            service: safeInt(service.provider_id),
            link: orderData.url,
            quantity: orderData.quantity,
        };
        if (service.type === "Package")
            delete payload.quantity;
        if (service.type === "Custom Comments") {
            payload.comments = orderData.comments;
        }
        const url = `${service.provider}`;
        const { data: res } = await axios_1.default.post(url, payload, { httpsAgent: agent });
        if (res.error) {
            // Rollback balance
            await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: user_initial_balance }, panel_id);
            await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
                provider_error: res.error,
                status: "Failed",
            }, panel_id);
            try {
                await (0, emails_1.sendEmail)(undefined, "new_failed_order", {
                    ...orderData,
                    user_balance: user_final_balance,
                    provider_error: res.error,
                    service_id: service.id,
                }, panel_id);
            }
            catch (e) {
                console.error("Email error (failed order):", e.message);
            }
            return { error: res.error };
        }
        await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
            provider_order_id: safeInt(res.order),
            provider: provider.url,
            price: chargeUSD,
        }, panel_id);
        await (0, emails_1.sendEmail)(undefined, "new_order", {
            ...orderData,
            user_balance: user_final_balance,
            service_id: service.id,
        }, panel_id);
        return { success: "Order sent to provider successfully" };
    }
    catch (err) {
        console.error("Error sending order to provider:", err.message);
        return { error: err.message || "Unknown error" };
    }
};
exports.sendOrderToProvider = sendOrderToProvider;
const updateOrderStatus = async (order_uid, panel_id) => {
    try {
        const order = (await (0, crud_1.getDocs)("orders", panel_id)).find((o) => o.uid === order_uid);
        if (!order)
            return;
        const provider = (await (0, crud_1.getDocs)("providers", panel_id)).find((p) => p.url === order.provider);
        if (!provider)
            return;
        const url = `${order.provider}`;
        const decryptedKey = (0, encrypt_1.decryptKey)(provider.key.encrypted_key, provider.key.iv);
        const data = {
            key: decryptedKey,
            action: "status",
            order: order.provider_order_id,
        };
        const { data: resp } = await axios_1.default.post(url, data, { httpsAgent: agent });
        const rates = await currencies();
        await (0, crud_1.updatePanelDoc)("orders", order.uid, {
            status: resp.status,
            provider_currency: resp.currency?.toUpperCase(),
            provider_price: safeFloat((0, ConvertCurrency_1.default)(safeFloat(resp.charge), resp.currency?.toUpperCase(), "USD", rates)),
            synced: true,
        }, panel_id);
    }
    catch (err) {
        console.error("Error updating order status:", err.message);
    }
};
const MAX_RETRIES = 3;
const sendUnsyncedOrders = async () => {
    try {
        const panelIds = (await db_1.pool.query(`SELECT DISTINCT panel_id FROM orders`)).rows.map((r) => r.panel_id);
        for (const panel_id of panelIds) {
            const filter = {
                synced: false,
                sync_order: true,
                drip_feed: false,
                retry_count: { $lt: MAX_RETRIES },
            };
            const unsynced = await (0, crud_1.getDocs)("orders", panel_id, { filter });
            for (const order of unsynced) {
                const result = await (0, exports.sendOrderToProvider)(order, panel_id);
                if (result.success) {
                    await (0, crud_1.updatePanelDoc)("orders", order.uid, { synced: true }, panel_id);
                }
                await (0, crud_1.updatePanelDoc)("orders", order.uid, {
                    retry_count: (order.retry_count || 0) + 1,
                }, panel_id);
            }
        }
    }
    catch (err) {
        console.error("Error syncing orders:", err.message);
    }
};
exports.sendUnsyncedOrders = sendUnsyncedOrders;
const syncOrderDetails = async (orderData, panel_id) => {
    try {
        const users = await (0, crud_1.getDocs)("users", panel_id);
        const user = users.find((u) => u.uid === orderData.user_uid);
        if (!user)
            return false;
        const providers = await (0, crud_1.getDocs)("providers", panel_id);
        const provider = providers.find((p) => p.url === orderData.provider);
        if (!provider)
            return false;
        const url = `${orderData.provider}`;
        const decryptedKey = (0, encrypt_1.decryptKey)(provider.key.encrypted_key, provider.key.iv);
        const data = {
            key: decryptedKey,
            action: "status",
            order: orderData.provider_order_id,
        };
        const { data: resp } = await axios_1.default.post(url, data, { httpsAgent: agent });
        let services;
        const getService = async () => {
            if (!services)
                services = await (0, crud_1.getDocs)("services", panel_id);
            return services.find((svc) => svc.id === orderData.service_id);
        };
        const rates = await currencies();
        if (resp.status === "Canceled" && orderData.status !== "Canceled") {
            const newBalance = safeFloat(user.balance) + safeFloat(orderData.price);
            await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: newBalance }, panel_id);
            await (0, crud_1.updatePanelDoc)("orders", orderData.uid, { status: "Canceled", price: 0 }, panel_id);
        }
        if (resp.status === "Partial" && orderData.status !== "Partial") {
            const service = await getService();
            if (!service)
                return false;
            const pricePer1000 = (0, ConvertCurrency_1.default)(service.price, service.provider_currency, "USD", rates) || 0;
            const refunded = safeFloat(orderData.number) - safeFloat(resp.remains);
            const totalPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
            const orderPrice = ((refunded / 1000) * pricePer1000).toFixed(2);
            const newBalance = safeFloat(user.balance) + safeFloat(totalPrice);
            await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: newBalance }, panel_id);
            await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
                status: "Partial",
                price: safeFloat(orderPrice),
                remains: safeInt(resp.remains),
            }, panel_id);
        }
        if (resp.status === "Completed" && orderData.status !== "Completed") {
            const service = await getService();
            if (!service)
                return false;
            const pricePer1000 = (0, ConvertCurrency_1.default)(service.price, service.provider_currency, "USD", rates);
            if (orderData.status === "Canceled") {
                const totalPrice = ((orderData.number / 1000) * pricePer1000).toFixed(2);
                const newBalance = safeFloat(user.balance) - safeFloat(totalPrice);
                await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: newBalance }, panel_id);
                await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
                    status: "Completed",
                    remains: 0,
                    price: safeFloat(totalPrice),
                }, panel_id);
            }
            else if (orderData.status === "Partial") {
                const originalPrice = ((orderData.number / 1000) *
                    pricePer1000).toFixed(2);
                const refundPrice = ((resp.remains / 1000) * pricePer1000).toFixed(2);
                const newBalance = safeFloat(user.balance) - safeFloat(refundPrice);
                await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: newBalance }, panel_id);
                await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
                    status: "Completed",
                    remains: 0,
                    price: safeFloat(originalPrice),
                }, panel_id);
            }
            else {
                await (0, crud_1.updatePanelDoc)("orders", orderData.uid, { status: "Completed", remains: 0 }, panel_id);
            }
        }
        await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
            status: resp.status,
            remains: safeInt(resp.remains),
            start: safeInt(resp.start_count),
            provider_price: safeFloat((0, ConvertCurrency_1.default)(safeFloat(resp.charge), resp.currency.toUpperCase(), "USD", rates)),
            provider_currency: resp.currency.toUpperCase(),
        }, panel_id);
        return true;
    }
    catch (err) {
        console.error("Error updatind order from provider:", err.message);
        return false;
    }
};
exports.syncOrderDetails = syncOrderDetails;
const syncAllPanelsOrderDetails = async () => {
    try {
        const panelIdsResult = await db_1.pool.query(`SELECT DISTINCT panel_id FROM orders`);
        const panelIds = panelIdsResult.rows.map((row) => row.panel_id);
        for (const panel_id of panelIds) {
            const syncedOrders = await (0, crud_1.getDocs)("orders", panel_id, {
                filter: { synced: true, sync_order: true },
            });
            for (const order of syncedOrders) {
                await (0, exports.syncOrderDetails)(order, panel_id);
            }
        }
    }
    catch (error) {
        console.error("Error syncing order details", error);
    }
};
exports.syncAllPanelsOrderDetails = syncAllPanelsOrderDetails;
const processDripFeedOrders = async () => {
    try {
        const panelIdsResult = await db_1.pool.query(`SELECT DISTINCT panel_id FROM orders`);
        const panelIds = panelIdsResult.rows.map((row) => row.panel_id);
        for (const panel_id of panelIds) {
            const dripFeedOrders = (await (0, crud_1.getDocs)("orders", panel_id, {
                filter: { status: "Completed", drip_feed: true },
            }));
            for (const order of dripFeedOrders) {
                const processedRuns = order.processed_runs || 0;
                const totalRuns = order.runs;
                const intervalMinutes = order.interval;
                if (processedRuns >= totalRuns)
                    continue;
                const nextRunTime = new Date(order.last_run_time || 0).getTime() +
                    intervalMinutes * 60000;
                if (Date.now() < nextRunTime)
                    continue;
                try {
                    await (0, crud_1.updatePanelDoc)("orders", order.uid, {
                        processed_runs: processedRuns + 1,
                        last_run_time: new Date().toISOString(),
                    }, panel_id);
                    const users = await (0, crud_1.getDocs)("users", panel_id);
                    const user = users.find((u) => u.uid === order.user_uid);
                    const services = await (0, crud_1.getDocs)("services", panel_id);
                    const service = services.find((s) => s.id === order.service_id);
                    if (!user || !service)
                        continue;
                    // Affiliate reward logic
                    if (user.ref) {
                        const affiliate_settings = await (0, crud_1.getDocs)("affiliate_settings", panel_id);
                        const affiliate = affiliate_settings[0];
                        const percentage = affiliate?.percent || 0;
                        const refUser = users.find((u) => u.id === user.ref);
                        if (refUser) {
                            const earned = (order.price * percentage) / 100;
                            const newBalance = safeFloat(refUser.balance) + earned;
                            await (0, crud_1.addPanelDoc)("referrals_orders", {
                                price: order.price,
                                username: user.username,
                                ref_id: user.ref,
                            }, panel_id);
                            await (0, crud_1.updatePanelDoc)("users", refUser.uid, { balance: newBalance }, panel_id);
                            await (0, crud_1.addPanelDoc)("transactions", {
                                status: "success",
                                amount: earned,
                                currency: "USD",
                                payment_method: "Amount earned from your referral's order.",
                                user_id: user.uid,
                            }, panel_id);
                        }
                    }
                    // Create new order from drip feed
                    const price = ((order.number / 1000) *
                        safeFloat(service.price)).toFixed(2);
                    const new_order = {
                        ...order,
                        provider: service.provider,
                        sync_order: true,
                        provider_service_id: service.provider_id,
                        price,
                    };
                    delete new_order.runs;
                    delete new_order.interval;
                    delete new_order.processed_runs;
                    delete new_order.drip_feed;
                    delete new_order.last_run_time;
                    const added = await (0, crud_1.addPanelDoc)("orders", new_order, panel_id);
                    new_order.uid = added.uid;
                    const result = await (0, exports.sendOrderToProvider)(new_order, panel_id);
                    if (result.success) {
                        await updateOrderStatus(new_order.uid, panel_id);
                    }
                }
                catch (err) {
                    console.error(`Error processing drip feed order [${order.uid}]: ${err.message}`);
                }
            }
        }
    }
    catch (error) {
        console.error(`Error fetching or processing drip feed orders: ${error.message}`);
    }
};
exports.processDripFeedOrders = processDripFeedOrders;
