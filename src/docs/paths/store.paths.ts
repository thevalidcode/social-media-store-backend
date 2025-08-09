import { registry } from "../components/registry";
import {
  StoreDataResponse,
  DesignStylesResponse,
  ExchangeRatesResponse,
  CurrentUserResponse,
  CurrentAdminResponse,
  NotFound,
  GeneralDataResponse,
} from "../responses/store.response";
import {
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import {
  UpdateGeneralDataRequestSchema,
  UpdateStylesRequestSchema,
} from "../../schemas/store.schema";

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

// GET /store/{storeId}/general-data
registry.registerPath({
  method: "get",
  path: "/store/{storeId}/general-data",
  summary: "Get the general data for a store",
  tags: ["Store"],
  parameters: [
    {
      name: "storeId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: GeneralDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// PATCH /store/general-data
registry.registerPath({
  method: "patch",
  path: "/store/general-data",
  summary: "Update the general data for a store",
  tags: ["Store"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateGeneralDataRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /store/{storeId}/styles
registry.registerPath({
  method: "get",
  path: "/store/{storeId}/styles",
  summary: "Get design styles for a store",
  tags: ["Store"],
  parameters: [
    {
      name: "storeId",
      in: "path",
      required: true,
      schema: { type: "number" },
    },
  ],
  responses: {
    200: DesignStylesResponse,
    500: ServerError,
  },
});

// PATCH /store/styles
registry.registerPath({
  method: "patch",
  path: "/store/styles",
  summary: "Update the styles for a store",
  tags: ["Store"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateStylesRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    404: NotFound,
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
