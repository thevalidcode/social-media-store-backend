"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processdrip_feedOrders = exports.updateServices = exports.updateRefillStatus = exports.saveRates = exports.sync_orders = exports.updateOrderStatus = exports.syncServices = exports.sync_orderDetails = exports.sendRefillToMainServer = exports.sendOrderToMainServer = void 0;
exports.getCurrentRates = getCurrentRates;
const crud_1 = require("./crud");
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const ConvertCurrency_1 = __importDefault(require("./utils/ConvertCurrency"));
const emails_1 = require("./utils/emails");
const db_1 = require("./config/db");
const rateKey = process.env.RATE_KEY;
const agent = new https_1.default.Agent({
    keepAlive: true,
    rejectUnauthorized: false,
});
const exchange_rates = async () => {
    const data = await (0, crud_1.getDocs)("exchange_rates", null, {
        find: { field: "uid", operator: "===", value: "latest" },
    });
    return data?.quotes || { USD: 1 };
};
const safeFloat = (n, d = 0) => Number.isFinite(+n) ? parseFloat(n) : d;
const safeInt = (n, d = 0) => Number.isFinite(+n) ? parseInt(n, 10) : d;
const sendOrderToMainServer = async (orderData, panel_id, serviceData) => {
    try {
        const user = (await (0, crud_1.getDocs)("users", panel_id)).find((u) => u.uid === orderData.user_uid);
        const provider = (await (0, crud_1.getDocs)("providers", panel_id)).find((p) => p.url === orderData.provider);
        if (!user || !provider)
            return false;
        const payload = {
            key: provider.key,
            action: "add",
            service: safeInt(orderData.provider_service_id),
            link: orderData.url,
            quantity: orderData.number,
        };
        if (serviceData?.type === "Package")
            delete payload.quantity;
        if (serviceData?.type === "Custom Comments")
            payload.comments = orderData.comments;
        const url = `https://${orderData.provider}/api/v2`;
        const { data: res } = await axios_1.default.post(url, payload, { httpsAgent: agent });
        if (res.error) {
            await (0, crud_1.updatePanelDoc)("orders", orderData.uid, {
                provider_error: res.error,
                status: "Failed",
            }, panel_id);
            try {
                await (0, emails_1.sendEmail)(undefined, "new_failed_order", {
                    ...orderData,
                    user_balance: orderData.user_final_balance,
                    provider_error: res.error,
                    service_id: orderData.service_id,
                }, panel_id);
            }
            catch (e) {
                console.error("Email error (failed order):", e.message);
            }
            return false;
        }
        await (0, crud_1.updatePanelDoc)("orders", orderData.uid, { provider_order_id: safeInt(res.order) }, panel_id);
        try {
            await (0, emails_1.sendEmail)(undefined, "new_order", {
                ...orderData,
                user_balance: orderData.user_final_balance,
                service_id: orderData.service_id,
            }, panel_id);
        }
        catch (e) {
            console.error("Email error (new order):", e.message);
        }
        return true;
    }
    catch (err) {
        console.error("Error sending order to main server:", err.message);
        return false;
    }
};
exports.sendOrderToMainServer = sendOrderToMainServer;
const sendRefillToMainServer = async (orderId, panel_id) => {
    try {
        const order = await (0, crud_1.getDocs)("orders", panel_id, {
            find: { field: "id", operator: "===", value: orderId },
        });
        const prov = await (0, crud_1.getDocs)("providers", panel_id, {
            find: { field: "url", operator: "===", value: order?.provider },
        });
        if (!order || !prov)
            return false;
        const url = `https://${order.provider}/api/v2`;
        const { data: res } = await axios_1.default.post(url, { key: prov.key, action: "refill", order: orderId }, { httpsAgent: agent });
        if (res.error) {
            try {
                await (0, emails_1.sendEmail)(undefined, "new_failed_refill", {
                    order_id: order.id,
                    username: order.username,
                    number: order.number,
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
            orderId: order.id,
            timestamp: new Date().toISOString(),
        }, panel_id);
        await updateRefillStatus(refillRow.uid, panel_id);
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
const updateRefillStatus = async (refillId, panel_id) => {
    try {
        const refill = (await (0, crud_1.getDocs)("refills", panel_id)).find((r) => r.uid === refillId);
        const provider = (await (0, crud_1.getDocs)("providers", panel_id)).find((p) => p.url === refill?.provider);
        if (!refill || !provider)
            return false;
        const url = `https://${refill.provider}/api/v2`;
        const { data: res } = await axios_1.default.post(url, {
            key: provider.key,
            action: "refill_status",
            refill: refill.provider_id,
        }, { httpsAgent: agent });
        if (res.error) {
            await (0, crud_1.updatePanelDoc)("refills", refillId, { error: res.error }, panel_id);
            return false;
        }
        await (0, crud_1.updatePanelDoc)("refills", refillId, { status: res.status }, panel_id);
        return true;
    }
    catch (err) {
        console.error("Error updating refill:", err.message);
        return false;
    }
};
exports.updateRefillStatus = updateRefillStatus;
const getOrderDetailsFromMainServer = async (orderData, panel_id) => {
    try {
        const users = await (0, crud_1.getDocs)("users", panel_id);
        const user = users.find((u) => u.uid === orderData.user_uid);
        if (!user)
            return false;
        const providers = await (0, crud_1.getDocs)("providers", panel_id);
        const provider = providers.find((p) => p.url === orderData.provider);
        if (!provider)
            return false;
        const url = `https://${orderData.provider}/api/v2`;
        const data = {
            key: provider.key,
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
        const rates = await exchange_rates();
        if (resp.status === "Canceled" && orderData.status !== "Canceled") {
            const newBalance = safeFloat(user.balance) + safeFloat(orderData.price);
            await (0, crud_1.updatePanelDoc)("users", user.uid, { balance: newBalance }, panel_id);
            await (0, crud_1.updatePanelDoc)("orders", orderData.uid, { status: "Canceled", price: 0 }, panel_id);
        }
        if (resp.status === "Partial" && orderData.status !== "Partial") {
            const service = await getService();
            if (!service)
                return false;
            const pricePer1000 = (0, ConvertCurrency_1.default)(service.price, service.provider_currency, "USD", rates);
            const refunded = safeFloat(orderData.number) - safeFloat(resp.remains);
            const totalPrice = ((resp.remains / 1000) * pricePer1000).toFixed(3);
            const orderPrice = ((refunded / 1000) * pricePer1000).toFixed(3);
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
                const totalPrice = ((orderData.number / 1000) * pricePer1000).toFixed(3);
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
                    pricePer1000).toFixed(3);
                const refundPrice = ((resp.remains / 1000) * pricePer1000).toFixed(3);
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
        console.error("Error syncing order to main server:", err.message);
        return false;
    }
};
const updateOrderStatus = async (orderId, panel_id) => {
    try {
        const order = (await (0, crud_1.getDocs)("orders", panel_id)).find((o) => o.uid === orderId);
        if (!order)
            return;
        const provider = (await (0, crud_1.getDocs)("providers", panel_id)).find((p) => p.url === order.provider);
        if (!provider)
            return;
        const url = `https://${order.provider}/api/v2`;
        const data = {
            key: provider.key,
            action: "status",
            order: order.provider_order_id,
        };
        const { data: resp } = await axios_1.default.post(url, data, { httpsAgent: agent });
        const rates = await exchange_rates();
        await (0, crud_1.updatePanelDoc)("orders", order.uid, {
            status: resp.status,
            provider_price: safeFloat((0, ConvertCurrency_1.default)(safeFloat(resp.charge), resp.currency, "USD", rates)),
            synced: true,
        }, panel_id);
    }
    catch (err) {
        console.error("Error updating order status:", err.message);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const columnExists = async (table, column) => {
    const res = await db_1.vsp_pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`, [table, column]);
    return res.rowCount > 0;
};
const sync_orders = async () => {
    try {
        const panelIds = (await db_1.vsp_pool.query(`SELECT DISTINCT panel_id FROM orders`)).rows.map((r) => r.panel_id);
        for (const panel_id of panelIds) {
            const hasDripFeed = await columnExists("orders", "drip_feed");
            const filter = {
                synced: false,
                sync_order: true,
                ...(hasDripFeed ? { drip_feed: false } : {}),
            };
            const unsynced = await (0, crud_1.getDocs)("orders", panel_id, { filter });
            for (const order of unsynced) {
                const service = (await (0, crud_1.getDocs)("services", panel_id)).find((s) => s.name === order.service);
                const ok = await sendOrderToMainServer(order, panel_id, service);
                if (ok)
                    await (0, crud_1.updatePanelDoc)("orders", order.uid, { synced: true }, panel_id);
            }
        }
    }
    catch (err) {
        console.error("Error syncing orders:", err.message);
    }
};
exports.sync_orders = sync_orders;
const updateServices = async () => {
    try {
        const panelIds = (await db_1.vsp_pool.query(`SELECT DISTINCT panel_id FROM services`)).rows.map((r) => r.panel_id);
        for (const panel_id of panelIds) {
            const services = await (0, crud_1.getDocs)("services", panel_id);
            const providers = await (0, crud_1.getDocs)("providers", panel_id);
            const provCache = {};
            for (const svc of services) {
                const prov = providers.find((p) => p.url === svc.provider);
                if (!prov)
                    continue;
                if (!provCache[prov.url]) {
                    const baseURL = `https://${prov.url}/api/v2`;
                    const [balanceRes, servicesRes] = await Promise.all([
                        axios_1.default.post(baseURL, { action: "balance", key: prov.key }, { httpsAgent: agent }),
                        axios_1.default.post(baseURL, { action: "services", key: prov.key }, { httpsAgent: agent }),
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
exports.updateServices = updateServices;
/* ------------------------------------------------------------------
 *  BULK SERVICE SYNC (insert new rows)
 * ------------------------------------------------------------------ */
const syncServices = async () => {
    try {
        const panels = await (0, crud_1.getDocs)("registered_panels");
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
                const baseURL = `https://${prov.url}/api/v2`;
                const [{ data: balance }, { data: svcList }] = await Promise.all([
                    axios_1.default.post(baseURL, { action: "balance", key: prov.key }, { httpsAgent: agent }),
                    axios_1.default.post(baseURL, { action: "services", key: prov.key }, { httpsAgent: agent }),
                ]);
                const provCur = balance.currency.toUpperCase();
                for (const s of svcList) {
                    if (!categories.some((c) => c.name === s.category)) {
                        categoryId++;
                        await (0, crud_1.addPanelDoc)("categories", {
                            name: s.category,
                            status: "active",
                            position: categoryId,
                            timestamp: new Date().toISOString(),
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
                        timestamp: new Date().toISOString(),
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
const sync_orderDetails = async () => {
    try {
        const panelIdsResult = await db_1.vsp_pool.query(`SELECT DISTINCT panel_id FROM orders`);
        const panelIds = panelIdsResult.rows.map((row) => row.panel_id);
        for (const panel_id of panelIds) {
            const syncedOrders = await (0, crud_1.getDocs)("orders", panel_id, {
                filter: { synced: true, sync_order: true },
            });
            for (const order of syncedOrders) {
                await getOrderDetailsFromMainServer(order, panel_id);
            }
        }
    }
    catch (error) {
        console.error("Error syncing order details", error);
    }
};
exports.sync_orderDetails = sync_orderDetails;
async function getCurrentRates() {
    try {
        const response = await axios_1.default.get(`http://apilayer.net/api/live?access_key=${rateKey}`);
        let data = response.data;
        data.timestamp = new Date();
        const quotes = {};
        for (const [currencyCode, rate] of Object.entries(data.quotes)) {
            const formattedCurrencyCode = currencyCode.substring(3);
            quotes[formattedCurrencyCode] = rate;
        }
        quotes["USD"] = 1;
        data.quotes = quotes;
        return data;
    }
    catch (error) {
        return null;
    }
}
const saveRates = async () => {
    const rates = await getCurrentRates();
    if (rates) {
        try {
            const existingRates = await (0, crud_1.getDocs)("exchange_rates");
            if (existingRates.length !== 0) {
                await (0, crud_1.updateDoc)("exchange_rates", "latest", rates);
            }
            else {
                await (0, crud_1.addDoc)("exchange_rates", { uid: "latest", ...rates });
            }
        }
        catch (error) {
            console.error("Error saving exchange rates to JSON database:", error);
        }
    }
};
exports.saveRates = saveRates;
const processdrip_feedOrders = async () => {
    try {
        const panelIdsResult = await db_1.vsp_pool.query(`SELECT DISTINCT panel_id FROM orders`);
        const panelIds = panelIdsResult.rows.map((row) => row.panel_id);
        for (const panel_id of panelIds) {
            const drip_feedOrders = (await (0, crud_1.getDocs)("orders", panel_id, {
                filter: { status: "Completed" },
            })).filter((order) => order.drip_feed);
            drip_feedOrders.forEach((order) => {
                let processedRuns = order.processedRuns || 0;
                const interval = order.interval;
                const drip_feedInterval = setInterval(async () => {
                    if (processedRuns >= order.runs) {
                        await (0, crud_1.updatePanelDoc)("orders", order.uid, { status: "Completed" }, panel_id);
                        clearInterval(drip_feedInterval);
                        return;
                    }
                    try {
                        await (0, crud_1.updatePanelDoc)("orders", order.uid, { processedRuns }, panel_id);
                        const users = await (0, crud_1.getDocs)("users", panel_id);
                        const user = users.find((u) => u.uid === order.user_uid);
                        const services = await (0, crud_1.getDocs)("services", panel_id);
                        const service = services.find((s) => s.id === order.service_id);
                        if (user.ref) {
                            const pages = await (0, crud_1.getDocs)("pages", panel_id);
                            const affiliate = pages.find((p) => p.uid === "affiliate");
                            const percentage = affiliate?.percent || 0;
                            const refUser = (await (0, crud_1.getDocs)("users", panel_id)).find((u) => u.id === user.ref);
                            const earned = (order.price * percentage) / 100;
                            const newBalance = refUser.balance + earned;
                            await (0, crud_1.addPanelDoc)("referrals_orders", {
                                price: order.price,
                                username: user.username,
                                refId: user.ref,
                            }, panel_id);
                            await (0, crud_1.updatePanelDoc)("users", refUser.uid, { balance: newBalance }, panel_id);
                            await (0, crud_1.addPanelDoc)("transactions", {
                                status: "success",
                                amount: earned,
                                currency: "USD",
                                payment_method: "Amount earned from your referral's order.",
                                user_id: user.uid,
                                timestamp: new Date(),
                            }, panel_id);
                        }
                        const new_order = {
                            ...order,
                            provider: service.provider,
                            sync_order: true,
                            provider_service_id: service.provider_id,
                            price: ((order.number / 1000) * service.price).toFixed(3),
                        };
                        delete new_order.runs;
                        delete new_order.interval;
                        delete new_order.processedRuns;
                        delete new_order.drip_feed;
                        const addedOrder = await (0, crud_1.addPanelDoc)("orders", new_order, panel_id);
                        new_order.uid = addedOrder.uid;
                        const success = await sendOrderToMainServer(new_order, panel_id, service);
                        if (success) {
                            await updateOrderStatus(new_order.uid, panel_id);
                        }
                    }
                    catch (error) {
                        console.error(`Error processing drip feed order: ${error.message}`);
                    }
                    processedRuns++;
                }, interval * 60000);
            });
        }
    }
    catch (error) {
        console.error(`Error fetching orders: ${error.message}`);
    }
};
exports.processdrip_feedOrders = processdrip_feedOrders;
