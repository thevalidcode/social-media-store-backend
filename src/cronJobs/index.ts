import cron from "node-cron";
import { saveRates } from "../utils/currency";
import {
  processDripFeedOrders,
  sendUnsyncedOrders,
  syncAllPanelsOrderDetails,
} from "../provider/order";
import { syncServices, updateExistingServices } from "../provider/service";

function startCronJobs() {
  cron.schedule("*/5 * * * *", () => {
    syncAllPanelsOrderDetails();
  });

  cron.schedule("0 */3 * * *", () => {
    sendUnsyncedOrders();
  });

  cron.schedule("*/20 * * * *", () => {
    processDripFeedOrders();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    saveRates();
  });

  cron.schedule("0 0,8,16 * * *", () => {
    updateExistingServices();
  });

  cron.schedule("0 2,9,18 * * *", () => {
    syncServices();
  });
}

export { startCronJobs };
