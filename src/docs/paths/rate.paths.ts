import { registry } from "../components/registry";
import { RatesResponse } from "../responses/rate.response";
import { BadRequest, ServerError } from "../responses/common.response";

/**
 * =========================
 * RATES ROUTES
 * =========================
 */

// Get exchange rate data
registry.registerPath({
  method: "get",
  path: "/rates",
  summary: "Get exchange rates data (public route)",
  tags: ["Exchange Rates"],
  responses: {
    200: RatesResponse,
    400: BadRequest,
    500: ServerError,
  },
});
