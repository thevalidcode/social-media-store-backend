import { registry } from "../components/registry";
import {
  PanelDataResponse,
  DesignStylesResponse,
  SiteDataResponse,
  ExchangeRatesResponse,
  CurrentUserResponse,
  CurrentAdminResponse,
  NotFound,
} from "../responses/panel.response";
import { ServerError, Forbidden } from "../responses/common.response";

// GET /panel/data
registry.registerPath({
  method: "get",
  path: "/panel/data",
  summary: "Get the panel data for a custom domain",
  tags: ["Panel"],
  parameters: [
    {
      name: "domain",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: PanelDataResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /panel/styles
registry.registerPath({
  method: "get",
  path: "/panel/styles",
  summary: "Get design styles for a panel",
  tags: ["Panel"],
  parameters: [
    {
      name: "panel_id",
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

// GET /panel/site-data
registry.registerPath({
  method: "get",
  path: "/panel/site-data",
  summary: "Get general site data for a panel",
  tags: ["Panel"],
  parameters: [
    {
      name: "panel_id",
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

// GET /panel/rates
registry.registerPath({
  method: "get",
  path: "/panel/rates",
  summary: "Get latest exchange rates",
  tags: ["Panel"],
  responses: {
    200: ExchangeRatesResponse,
    500: ServerError,
  },
});

// GET /panel/current-user
registry.registerPath({
  method: "get",
  path: "/panel/current-user",
  summary: "Get the currently authenticated user",
  tags: ["Panel"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: CurrentUserResponse,
    404: NotFound,
    500: ServerError,
  },
});

// GET /panel/current-admin
registry.registerPath({
  method: "get",
  path: "/panel/current-admin",
  summary: "Get the currently authenticated admin",
  tags: ["Panel"],
  security: [{ bearerAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "query",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: CurrentAdminResponse,
    403: Forbidden,
    404: NotFound,
    500: ServerError,
  },
});
