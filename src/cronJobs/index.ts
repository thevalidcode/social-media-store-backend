import cron from "node-cron";
import { saveRates } from "./currencies/currency";

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

  cron.schedule("0 0,8,16 * * *", () => {
    saveRates();
  });
}

export { startCronJobs };
