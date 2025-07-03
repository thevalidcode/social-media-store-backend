"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const currency_1 = require("../utils/currency");
const order_1 = require("../provider/order");
const service_1 = require("../provider/service");
function startCronJobs() {
    node_cron_1.default.schedule("*/5 * * * *", () => {
        (0, order_1.syncAllPanelsOrderDetails)();
    });
    node_cron_1.default.schedule("0 */3 * * *", () => {
        (0, order_1.sendUnsyncedOrders)();
    });
    node_cron_1.default.schedule("*/20 * * * *", () => {
        (0, order_1.processDripFeedOrders)();
    });
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, currency_1.saveRates)();
    });
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, service_1.updateExistingServices)();
    });
    node_cron_1.default.schedule("0 2,9,18 * * *", () => {
        (0, service_1.syncServices)();
    });
}
