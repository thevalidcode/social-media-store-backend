import cron from "node-cron";
import {
  processDripFeedOrders,
  sendUnsyncedOrders,
  syncAllStoresOrderDetails,
} from "../providers/order.providers";
import {
  syncServices,
  updateExistingServices,
} from "../providers/service.providers";
import { syncExchangeRates } from "../controllers/rate.controllers";

function startCronJobs() {
  cron.schedule("*/5 * * * *", () => {
    syncAllStoresOrderDetails();
  });

  cron.schedule("0 */3 * * *", () => {
    sendUnsyncedOrders();
  });

  cron.schedule("*/20 * * * *", () => {
    processDripFeedOrders();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    updateExistingServices();
  });

  cron.schedule("0 2,9,18 * * *", () => {
    syncServices();
  });

  cron.schedule("0 6,14,22 * * *", async () => {
    await syncExchangeRates();
  });
}

export { startCronJobs };
