"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const ApiSync_1 = require("../ApiSync");
function startCronJobs() {
    node_cron_1.default.schedule("*/5 * * * *", () => {
        (0, ApiSync_1.sync_orderDetails)();
    });
    node_cron_1.default.schedule("0 */3 * * *", () => {
        (0, ApiSync_1.sync_orders)();
    });
    node_cron_1.default.schedule("*/20 * * * *", () => {
        (0, ApiSync_1.processdrip_feedOrders)();
    });
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, ApiSync_1.saveRates)();
    });
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, ApiSync_1.updateServices)();
    });
    node_cron_1.default.schedule("0 2,9,18 * * *", () => {
        (0, ApiSync_1.syncServices)();
    });
}
