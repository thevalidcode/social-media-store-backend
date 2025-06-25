"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const currency_1 = require("./currencies/currency");
function startCronJobs() {
    //   cron.schedule("*/5 * * * *", () => {
    //     sync_orderDetails();
    //   });
    //   cron.schedule("0 */3 * * *", () => {
    //     sync_orders();
    //   });
    //   cron.schedule("*/20 * * * *", () => {
    //     processdrip_feedOrders();
    //   });
    //   cron.schedule("0 0,8,16 * * *", () => {
    //     updateServices();
    //   });
    //   cron.schedule("0 2,9,18 * * *", () => {
    //     syncServices();
    //   });
    node_cron_1.default.schedule("0 0,8,16 * * *", () => {
        (0, currency_1.saveRates)();
    });
}
