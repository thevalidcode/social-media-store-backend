// import {
//   getDocs,
//   addPanelDoc,
//   updatePanelDoc,
//   addDoc,
//   updateDoc,
// } from "./crud";
// import axios from "axios";
// import https from "https";
// import convertCurrency from "./utils/ConvertCurrency";
// import { sendEmail } from "./utils/emails";
// import { pool } from "./config/db";
// const rateKey = process.env.RATE_KEY;
// const agent = new https.Agent({
//   keepAlive: true,
//   rejectUnauthorized: false,
// });

// const currencies = async (): Promise<Record<string, number>> => {
//   const data = await getDocs("currencies", null, {
//     find: { field: "uid", operator: "===", value: "latest" },
//   });
//   return data?.quotes || { USD: 1 };
// };

// const safeFloat = (n: any, d = 0): number =>
//   Number.isFinite(+n) ? parseFloat(n) : d;

// const safeInt = (n: any, d = 0): number =>
//   Number.isFinite(+n) ? parseInt(n, 10) : d;

// const sendOrderToMainServer = async (
//   orderData: any,
//   panel_id: number,
//   serviceData: any
// ): Promise<boolean> => {
//   try {
//     const user = (await getDocs("users", panel_id)).find(
//       (u: any) => u.uid === orderData.user_uid
//     );
//     const provider = (await getDocs("providers", panel_id)).find(
//       (p: any) => p.url === orderData.provider
//     );
//     if (!user || !provider) return false;

//     const payload: any = {
//       key: provider.key,
//       action: "add",
//       service: safeInt(orderData.provider_service_id),
//       link: orderData.url,
//       quantity: orderData.number,
//     };

//     if (serviceData?.type === "Package") delete payload.quantity;
//     if (serviceData?.type === "Custom Comments")
//       payload.comments = orderData.comments;

//     const url = `https://${orderData.provider}/api/v2`;
//     const { data: res } = await axios.post(url, payload, { httpsAgent: agent });

//     if (res.error) {
//       await updatePanelDoc(
//         "orders",
//         orderData.uid,
//         {
//           provider_error: res.error,
//           status: "Failed",
//         },
//         panel_id
//       );

//       try {
//         await sendEmail(
//           undefined,
//           "new_failed_order",
//           {
//             ...orderData,
//             user_balance: orderData.user_final_balance,
//             provider_error: res.error,
//             service_id: orderData.service_id,
//           },
//           panel_id
//         );
//       } catch (e: any) {
//         console.error("Email error (failed order):", e.message);
//       }

//       return false;
//     }

//     await updatePanelDoc(
//       "orders",
//       orderData.uid,
//       { provider_order_id: safeInt(res.order) },
//       panel_id
//     );

//     try {
//       await sendEmail(
//         undefined,
//         "new_order",
//         {
//           ...orderData,
//           user_balance: orderData.user_final_balance,
//           service_id: orderData.service_id,
//         },
//         panel_id
//       );
//     } catch (e: any) {
//       console.error("Email error (new order):", e.message);
//     }

//     return true;
//   } catch (err: any) {
//     console.error("Error sending order to main server:", err.message);
//     return false;
//   }
// };

// const sendRefillToMainServer = async (
//   orderId: number,
//   panel_id: number
// ): Promise<boolean> => {
//   try {
//     const order = await getDocs("orders", panel_id, {
//       find: { field: "id", operator: "===", value: orderId },
//     });
//     const prov = await getDocs("providers", panel_id, {
//       find: { field: "url", operator: "===", value: order?.provider },
//     });
//     if (!order || !prov) return false;

//     const url = `https://${order.provider}/api/v2`;
//     const { data: res } = await axios.post(
//       url,
//       { key: prov.key, action: "refill", order: orderId },
//       { httpsAgent: agent }
//     );

//     if (res.error) {
//       try {
//         await sendEmail(
//           undefined,
//           "new_failed_refill",
//           {
//             order_id: order.id,
//             username: order.username,
//             number: order.number,
//             price: order.price,
//             provider: order.provider,
//             error: res.error,
//           },
//           panel_id
//         );
//       } catch (e: any) {
//         console.error("Email error (failed refill):", e.message);
//       }
//       return false;
//     }

//     const refillRow = await addPanelDoc(
//       "refills",
//       {
//         provider_id: safeInt(res.refill),
//         provider: order.provider,
//         url: order.url,
//         orderId: order.id,
//         timestamp: new Date().toISOString(),
//       },
//       panel_id
//     );

//     await updateRefillStatus(refillRow.uid, panel_id);

//     try {
//       await sendEmail(
//         undefined,
//         "new_refill",
//         {
//           order_id: order.id,
//           username: order.username,
//           number: order.number,
//           price: order.price,
//           provider: order.provider,
//         },
//         panel_id
//       );
//     } catch (e: any) {
//       console.error("Email error (new refill):", e.message);
//     }

//     return true;
//   } catch (err: any) {
//     console.error("Error sending refill to main server:", err.message);
//     return false;
//   }
// };

// const updateRefillStatus = async (
//   refillId: string,
//   panel_id: number
// ): Promise<boolean> => {
//   try {
//     const refill = (await getDocs("refills", panel_id)).find(
//       (r: any) => r.uid === refillId
//     );
//     const provider = (await getDocs("providers", panel_id)).find(
//       (p: any) => p.url === refill?.provider
//     );
//     if (!refill || !provider) return false;

//     const url = `https://${refill.provider}/api/v2`;
//     const { data: res } = await axios.post(
//       url,
//       {
//         key: provider.key,
//         action: "refill_status",
//         refill: refill.provider_id,
//       },
//       { httpsAgent: agent }
//     );

//     if (res.error) {
//       await updatePanelDoc("refills", refillId, { error: res.error }, panel_id);
//       return false;
//     }

//     await updatePanelDoc("refills", refillId, { status: res.status }, panel_id);
//     return true;
//   } catch (err: any) {
//     console.error("Error updating refill:", err.message);
//     return false;
//   }
// };

// const getOrderDetailsFromMainServer = async (
//   orderData: any,
//   panel_id: number
// ): Promise<boolean> => {
//   try {
//     const users = await getDocs("users", panel_id);
//     const user = users.find((u: any) => u.uid === orderData.user_uid);
//     if (!user) return false;

//     const providers = await getDocs("providers", panel_id);
//     const provider = providers.find((p: any) => p.url === orderData.provider);
//     if (!provider) return false;

//     const url = `https://${orderData.provider}/api/v2`;
//     const data = {
//       key: provider.key,
//       action: "status",
//       order: orderData.provider_order_id,
//     };
//     const { data: resp } = await axios.post(url, data, { httpsAgent: agent });

//     let services: any[];
//     const getService = async () => {
//       if (!services) services = await getDocs("services", panel_id);
//       return services.find((svc) => svc.id === orderData.service_id);
//     };

//     const rates = await currencies();

//     if (resp.status === "Canceled" && orderData.status !== "Canceled") {
//       const newBalance = safeFloat(user.balance) + safeFloat(orderData.price);
//       await updatePanelDoc(
//         "users",
//         user.uid,
//         { balance: newBalance },
//         panel_id
//       );
//       await updatePanelDoc(
//         "orders",
//         orderData.uid,
//         { status: "Canceled", price: 0 },
//         panel_id
//       );
//     }

//     if (resp.status === "Partial" && orderData.status !== "Partial") {
//       const service = await getService();
//       if (!service) return false;

//       const pricePer1000 = convertCurrency(
//         service.price,
//         service.provider_currency,
//         "USD",
//         rates
//       );
//       const refunded = safeFloat(orderData.number) - safeFloat(resp.remains);
//       const totalPrice = ((resp.remains / 1000) * pricePer1000).toFixed(3);
//       const orderPrice = ((refunded / 1000) * pricePer1000).toFixed(3);
//       const newBalance = safeFloat(user.balance) + safeFloat(totalPrice);

//       await updatePanelDoc(
//         "users",
//         user.uid,
//         { balance: newBalance },
//         panel_id
//       );
//       await updatePanelDoc(
//         "orders",
//         orderData.uid,
//         {
//           status: "Partial",
//           price: safeFloat(orderPrice),
//           remains: safeInt(resp.remains),
//         },
//         panel_id
//       );
//     }

//     if (resp.status === "Completed" && orderData.status !== "Completed") {
//       const service = await getService();
//       if (!service) return false;

//       const pricePer1000 = convertCurrency(
//         service.price,
//         service.provider_currency,
//         "USD",
//         rates
//       );

//       if (orderData.status === "Canceled") {
//         const totalPrice = ((orderData.number / 1000) * pricePer1000).toFixed(
//           3
//         );
//         const newBalance = safeFloat(user.balance) - safeFloat(totalPrice);
//         await updatePanelDoc(
//           "users",
//           user.uid,
//           { balance: newBalance },
//           panel_id
//         );
//         await updatePanelDoc(
//           "orders",
//           orderData.uid,
//           {
//             status: "Completed",
//             remains: 0,
//             price: safeFloat(totalPrice),
//           },
//           panel_id
//         );
//       } else if (orderData.status === "Partial") {
//         const originalPrice = (
//           (orderData.number / 1000) *
//           pricePer1000
//         ).toFixed(3);
//         const refundPrice = ((resp.remains / 1000) * pricePer1000).toFixed(3);
//         const newBalance = safeFloat(user.balance) - safeFloat(refundPrice);
//         await updatePanelDoc(
//           "users",
//           user.uid,
//           { balance: newBalance },
//           panel_id
//         );
//         await updatePanelDoc(
//           "orders",
//           orderData.uid,
//           {
//             status: "Completed",
//             remains: 0,
//             price: safeFloat(originalPrice),
//           },
//           panel_id
//         );
//       } else {
//         await updatePanelDoc(
//           "orders",
//           orderData.uid,
//           { status: "Completed", remains: 0 },
//           panel_id
//         );
//       }
//     }

//     await updatePanelDoc(
//       "orders",
//       orderData.uid,
//       {
//         status: resp.status,
//         remains: safeInt(resp.remains),
//         start: safeInt(resp.start_count),
//         provider_price: safeFloat(
//           convertCurrency(
//             safeFloat(resp.charge),
//             resp.currency.toUpperCase(),
//             "USD",
//             rates
//           )
//         ),
//         provider_currency: resp.currency.toUpperCase(),
//       },
//       panel_id
//     );

//     return true;
//   } catch (err: any) {
//     console.error("Error syncing order to main server:", err.message);
//     return false;
//   }
// };

// const updateOrderStatus = async (
//   orderId: string,
//   panel_id: number
// ): Promise<void> => {
//   try {
//     const order = (await getDocs("orders", panel_id)).find(
//       (o: any) => o.uid === orderId
//     );
//     if (!order) return;

//     const provider = (await getDocs("providers", panel_id)).find(
//       (p: any) => p.url === order.provider
//     );
//     if (!provider) return;

//     const url = `https://${order.provider}/api/v2`;
//     const data = {
//       key: provider.key,
//       action: "status",
//       order: order.provider_order_id,
//     };
//     const { data: resp } = await axios.post(url, data, { httpsAgent: agent });
//     const rates = await currencies();

//     await updatePanelDoc(
//       "orders",
//       order.uid,
//       {
//         status: resp.status,
//         provider_price: safeFloat(
//           convertCurrency(safeFloat(resp.charge), resp.currency, "USD", rates)
//         ),
//         synced: true,
//       },
//       panel_id
//     );
//   } catch (err: any) {
//     console.error("Error updating order status:", err.message);
//   }
// };

// const columnExists = async (
//   table: string,
//   column: string
// ): Promise<boolean> => {
//   const res = await pool.query(
//     `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
//     [table, column]
//   );
//   return res.rowCount > 0;
// };

// const sync_orders = async (): Promise<void> => {
//   try {
//     const panelIds = (
//       await pool.query(`SELECT DISTINCT panel_id FROM orders`)
//     ).rows.map((r: any) => r.panel_id);

//     for (const panel_id of panelIds) {
//       const hasDripFeed = await columnExists("orders", "drip_feed");
//       const filter: Record<string, any> = {
//         synced: false,
//         sync_order: true,
//         ...(hasDripFeed ? { drip_feed: false } : {}),
//       };

//       const unsynced = await getDocs("orders", panel_id, { filter });

//       for (const order of unsynced) {
//         const service = (await getDocs("services", panel_id)).find(
//           (s: any) => s.name === order.service
//         );
//         const ok = await sendOrderToMainServer(order, panel_id, service);
//         if (ok)
//           await updatePanelDoc("orders", order.uid, { synced: true }, panel_id);
//       }
//     }
//   } catch (err: any) {
//     console.error("Error syncing orders:", err.message);
//   }
// };

// const updateServices = async (): Promise<void> => {
//   try {
//     const panelIds = (
//       await pool.query(`SELECT DISTINCT panel_id FROM services`)
//     ).rows.map((r: any) => r.panel_id);

//     for (const panel_id of panelIds) {
//       const services = await getDocs("services", panel_id);
//       const providers = await getDocs("providers", panel_id);

//       const provCache: Record<string, any> = {};

//       for (const svc of services) {
//         const prov = providers.find((p: any) => p.url === svc.provider);
//         if (!prov) continue;

//         if (!provCache[prov.url]) {
//           const baseURL = `https://${prov.url}/api/v2`;
//           const [balanceRes, servicesRes] = await Promise.all([
//             axios.post(
//               baseURL,
//               { action: "balance", key: prov.key },
//               { httpsAgent: agent }
//             ),
//             axios.post(
//               baseURL,
//               { action: "services", key: prov.key },
//               { httpsAgent: agent }
//             ),
//           ]);

//           provCache[prov.url] = {
//             currency: balanceRes.data.currency.toUpperCase(),
//             list: servicesRes.data,
//           };
//         }

//         const { currency: provCur, list } = provCache[prov.url];
//         const liveSvc = list.find(
//           (x: any) => String(x.service) === String(svc.provider_id)
//         );

//         if (!liveSvc) {
//           await updatePanelDoc(
//             "services",
//             svc.uid,
//             { status: "disabled" },
//             panel_id
//           );
//           continue;
//         }

//         const calcPrice =
//           safeFloat(liveSvc.rate) +
//           (safeFloat(liveSvc.rate) * svc.percentage) / 100;
//         const priceUSD = safeFloat(calcPrice).toFixed(3);

//         await updatePanelDoc(
//           "services",
//           svc.uid,
//           {
//             type: liveSvc.type,
//             provider_price: safeFloat(liveSvc.rate),
//             price: safeFloat(priceUSD),
//             cancel: liveSvc.cancel,
//             provider_currency: provCur,
//             network: liveSvc.network || "None",
//             refill: liveSvc.refill,
//           },
//           panel_id
//         );

//         if (liveSvc.description) {
//           await updatePanelDoc(
//             "services",
//             svc.uid,
//             { description: liveSvc.description },
//             panel_id
//           );
//         }

//         if (svc.sync_quantity) {
//           await updatePanelDoc(
//             "services",
//             svc.uid,
//             {
//               min: safeInt(liveSvc.min),
//               max: safeInt(liveSvc.max),
//             },
//             panel_id
//           );
//         }

//         if (svc.sync_cat_and_name) {
//           await updatePanelDoc(
//             "services",
//             svc.uid,
//             {
//               name: liveSvc.name,
//               category: liveSvc.category,
//             },
//             panel_id
//           );
//         }
//       }
//     }
//   } catch (err: any) {
//     console.error("Error updating services:", err.message);
//   }
// };
// /* ------------------------------------------------------------------
//  *  BULK SERVICE SYNC (insert new rows)
//  * ------------------------------------------------------------------ */
// const syncServices = async () => {
//   try {
//     const panels = await getDocs("panels");

//     for (const p of panels) {
//       const panel_id = p.panel_id;
//       const providers = (await getDocs("providers", panel_id)).filter(
//         (pr) => pr.sync
//       );
//       if (!providers.length) continue;

//       const services = await getDocs("services", panel_id);
//       const categories = await getDocs("categories", panel_id);

//       let maxId = services.reduce((m, s) => Math.max(m, s.id), 0);
//       let categoryId = categories.length;

//       for (const prov of providers) {
//         const baseURL = `https://${prov.url}/api/v2`;
//         const [{ data: balance }, { data: svcList }] = await Promise.all([
//           axios.post(
//             baseURL,
//             { action: "balance", key: prov.key },
//             { httpsAgent: agent }
//           ),
//           axios.post(
//             baseURL,
//             { action: "services", key: prov.key },
//             { httpsAgent: agent }
//           ),
//         ]);

//         const provCur = balance.currency.toUpperCase();

//         for (const s of svcList) {
//           if (!categories.some((c) => c.name === s.category)) {
//             categoryId++;
//             await addPanelDoc(
//               "categories",
//               {
//                 name: s.category,
//                 status: "active",
//                 position: categoryId,
//                 timestamp: new Date().toISOString(),
//               },
//               panel_id
//             );
//           }

//           const exists = services.find(
//             (x) => safeInt(x.provider_id) === safeInt(s.service)
//           );
//           if (exists) continue;

//           maxId++;
//           const calcPrice =
//             safeFloat(s.rate) + (safeFloat(s.rate) * prov.percentage) / 100;
//           const endPrice = safeFloat(calcPrice).toFixed(3);

//           const row = {
//             id: maxId,
//             name: s.name,
//             category: s.category,
//             type: s.type,
//             provider_currency: provCur,
//             min: safeInt(s.min),
//             max: safeInt(s.max),
//             provider_id: safeInt(s.service),
//             description: s.description || "",
//             provider_price: safeFloat(s.rate),
//             panel_id,
//             status: "active",
//             sync_quantity: true,
//             sync_cat_and_name: true,
//             price: safeFloat(endPrice),
//             position: maxId,
//             cancel: s.cancel,
//             network: s.network || "None",
//             refill: s.refill,
//             percentage: prov.percentage,
//             drip_feed: false,
//             provider: prov.url,
//             timestamp: new Date().toISOString(),
//           };

//           await addPanelDoc("services", row, panel_id);

//           try {
//             await sendEmail(
//               undefined,
//               "new_service",
//               {
//                 ...row,
//                 provider_currency: row.provider_currency,
//                 provider_price: row.provider_price,
//               },
//               panel_id
//             );
//           } catch (err) {
//             console.error(`Email error (panel ${panel_id}):`, err.message);
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.error("Error syncing services:", err.message);
//   }
// };

// const sync_orderDetails = async () => {
//   try {
//     const panelIdsResult = await pool.query(
//       `SELECT DISTINCT panel_id FROM orders`
//     );
//     const panelIds = panelIdsResult.rows.map((row) => row.panel_id);

//     for (const panel_id of panelIds) {
//       const syncedOrders = await getDocs("orders", panel_id, {
//         filter: { synced: true, sync_order: true },
//       });

//       for (const order of syncedOrders) {
//         await getOrderDetailsFromMainServer(order, panel_id);
//       }
//     }
//   } catch (error) {
//     console.error("Error syncing order details", error);
//   }
// };

// async function getCurrentRates() {
//   try {
//     const response = await axios.get(
//       `http://apilayer.net/api/live?access_key=${rateKey}`
//     );
//     let data = response.data;
//     data.timestamp = new Date();

//     const quotes = {};
//     for (const [currencyCode, rate] of Object.entries(data.quotes)) {
//       const formattedCurrencyCode = currencyCode.substring(3);
//       quotes[formattedCurrencyCode] = rate;
//     }
//     quotes["USD"] = 1;
//     data.quotes = quotes;

//     return data;
//   } catch (error) {
//     return null;
//   }
// }

// const saveRates = async () => {
//   const rates = await getCurrentRates();
//   if (rates) {
//     try {
//       const existingRates = await getDocs("currencies");
//       if (existingRates.length !== 0) {
//         await updateDoc("currencies", "latest", rates);
//       } else {
//         await addDoc("currencies", { uid: "latest", ...rates });
//       }
//     } catch (error) {
//       console.error("Error saving exchange rates to JSON database:", error);
//     }
//   }
// };

// const processdrip_feedOrders = async () => {
//   try {
//     const panelIdsResult = await pool.query(
//       `SELECT DISTINCT panel_id FROM orders`
//     );
//     const panelIds = panelIdsResult.rows.map((row) => row.panel_id);

//     for (const panel_id of panelIds) {
//       const drip_feedOrders = (
//         await getDocs("orders", panel_id, {
//           filter: { status: "Completed" },
//         })
//       ).filter((order) => order.drip_feed);

//       drip_feedOrders.forEach((order) => {
//         let processedRuns = order.processedRuns || 0;
//         const interval = order.interval;

//         const drip_feedInterval = setInterval(async () => {
//           if (processedRuns >= order.runs) {
//             await updatePanelDoc(
//               "orders",
//               order.uid,
//               { status: "Completed" },
//               panel_id
//             );
//             clearInterval(drip_feedInterval);
//             return;
//           }

//           try {
//             await updatePanelDoc(
//               "orders",
//               order.uid,
//               { processedRuns },
//               panel_id
//             );

//             const users = await getDocs("users", panel_id);
//             const user = users.find((u) => u.uid === order.user_uid);

//             const services = await getDocs("services", panel_id);
//             const service = services.find((s) => s.id === order.service_id);

//             if (user.ref) {
//               const pages = await getDocs("pages", panel_id);
//               const affiliate = pages.find((p) => p.uid === "affiliate");

//               const percentage = affiliate?.percent || 0;
//               const refUser = (await getDocs("users", panel_id)).find(
//                 (u) => u.id === user.ref
//               );

//               const earned = (order.price * percentage) / 100;
//               const newBalance = refUser.balance + earned;

//               await addPanelDoc(
//                 "referrals_orders",
//                 {
//                   price: order.price,
//                   username: user.username,
//                   refId: user.ref,
//                 },
//                 panel_id
//               );

//               await updatePanelDoc(
//                 "users",
//                 refUser.uid,
//                 { balance: newBalance },
//                 panel_id
//               );

//               await addPanelDoc(
//                 "transactions",
//                 {
//                   status: "success",
//                   amount: earned,
//                   currency: "USD",
//                   payment_method: "Amount earned from your referral's order.",
//                   user_id: user.uid,
//                   timestamp: new Date(),
//                 },
//                 panel_id
//               );
//             }

//             const new_order = {
//               ...order,
//               provider: service.provider,
//               sync_order: true,
//               provider_service_id: service.provider_id,
//               price: ((order.number / 1000) * service.price).toFixed(3),
//             };

//             delete new_order.runs;
//             delete new_order.interval;
//             delete new_order.processedRuns;
//             delete new_order.drip_feed;

//             const addedOrder = await addPanelDoc("orders", new_order, panel_id);
//             new_order.uid = addedOrder.uid;

//             const success = await sendOrderToMainServer(
//               new_order,
//               panel_id,
//               service
//             );
//             if (success) {
//               await updateOrderStatus(new_order.uid, panel_id);
//             }
//           } catch (error) {
//             console.error(`Error processing drip feed order: ${error.message}`);
//           }

//           processedRuns++;
//         }, interval * 60000);
//       });
//     }
//   } catch (error) {
//     console.error(`Error fetching orders: ${error.message}`);
//   }
// };

// export {
//   sendOrderToMainServer,
//   sendRefillToMainServer,
//   sync_orderDetails,
//   syncServices,
//   updateOrderStatus,
//   sync_orders,
//   saveRates,
//   getCurrentRates,
//   updateRefillStatus,
//   updateServices,
//   processdrip_feedOrders,
// };
