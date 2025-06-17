const cron = require("node-cron");
const {
  sync_orders,
  saveRates,
  sync_orderDetails,
  updateServices,
  syncServices,
  processdrip_feedOrders,
} = require("../ApiSync");

function startCronJobs() {
  cron.schedule("*/5 * * * *", () => {
    sync_orderDetails();
  });

  cron.schedule("0 */3 * * *", () => {
    sync_orders();
  });

  cron.schedule("*/20 * * * *", () => {
    processdrip_feedOrders();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    saveRates();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    updateServices();
  });

  cron.schedule("0 2,9,18 * * *", () => {
    syncServices();
  });
}

module.exports = { startCronJobs };
