import { registry } from "../components/registry";
import {
  StoreDataResponse,
  DesignStylesResponse,
  SiteDataResponse,
  ExchangeRatesResponse,
  CurrentUserResponse,
  CurrentAdminResponse,
  CSrfTokenResponse,
  NotFound,
} from "../responses/store.response";
import { ServerError, Forbidden } from "../responses/common.response";

// GET /store/data
registry.registerPath({
  method: "get",
  path: "/store/data",
  summary: "Get the store data for a custom domain",
  tags: ["Store"],
  parameters: [
    {
      name: "domain",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: StoreDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /store/csrf-token
registry.registerPath({
  method: "get",
  path: "/store/csrf-token",
  description:
    "Retrieve a CSRF token which must be included in all subsequent requests that mutate data (e.g., POST, PATCH, DELETE). The frontend must extract the token from this response and send it in the 'X-CSRF-Token' header for every protected request. This ensures protection against Cross-Site Request Forgery (CSRF) attacks.",
  summary: "Get the csrf token for a custom domain",
  tags: ["Store"],
  parameters: [
    {
      name: "domain",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: CSrfTokenResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /store/styles
registry.registerPath({
  method: "get",
  path: "/store/styles",
  summary: "Get design styles for a store",
  tags: ["Store"],
  parameters: [
    {
      name: "store_id",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: DesignStylesResponse,
    500: ServerError,
  },
});

// GET /store/site-data
registry.registerPath({
  method: "get",
  path: "/store/site-data",
  summary: "Get general site data for a store",
  tags: ["Store"],
  parameters: [
    {
      name: "store_id",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SiteDataResponse,
    500: ServerError,
  },
});

// GET /store/rates
registry.registerPath({
  method: "get",
  path: "/store/rates",
  summary: "Get latest exchange rates",
  tags: ["Store"],
  responses: {
    200: ExchangeRatesResponse,
    500: ServerError,
  },
});

// GET /store/current-user
registry.registerPath({
  method: "get",
  path: "/store/current-user",
  summary: "Get the currently authenticated user",
  tags: ["Store"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: CurrentUserResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /store/current-admin
registry.registerPath({
  method: "get",
  path: "/store/current-admin",
  summary: "Get the currently authenticated admin",
  tags: ["Store"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: CurrentAdminResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
