import express from "express";
import * as reseller from "../controllers/reseller.controllers";
import {
  resellerSourceServicesRateLimit,
  resellerSourceStoresRateLimit,
} from "../middleware/ratelimit/reseller.ratelimit";

const router = express.Router();

router.get(
  "/providers",
  resellerSourceStoresRateLimit,
  reseller.getSourceProviders,
);
router.get(
  "/providers/:providerId/services",
  resellerSourceServicesRateLimit,
  reseller.getProviderServices,
);

export default router;
