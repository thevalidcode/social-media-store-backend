import { registry } from "../components/registry";
import {
  TransactionListResponse,
  TransactionPublicListResponse,
} from "../responses/transaction.response";
import { BadRequest, ServerError } from "../responses/common.response";

// GET /transactions
registry.registerPath({
  method: "get",
  path: "/transactions",
  summary: "Get a user's transactions",
  tags: ["Transactions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: TransactionPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/transactions/admin",
  summary: "Get all transactions for admins",
  tags: ["Transactions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: TransactionListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
