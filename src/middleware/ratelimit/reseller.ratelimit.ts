import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const resellerSourceStoresRateLimit = devBypass(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many source store requests, please try again later.",
    },
  }),
);

export const resellerSourceServicesRateLimit = devBypass(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many source service requests, please try again later.",
    },
  }),
);

export const resellerImportRateLimit = devBypass(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      error: "Too many reseller import requests, please try again later.",
    },
  }),
);
