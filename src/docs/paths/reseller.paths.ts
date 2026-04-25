import { registry } from "../components/registry";
import {
  ProviderIdParamsSchema,
  ResellerImportServicesSchema,
  ResellerSyncServicesSchema,
  SourceStoresQuerySchema,
} from "../../schemas/reseller.schema";
import {
  BadRequest,
  NotFound,
  ServerError,
} from "../responses/common.response";
import {
  ResellerImportServicesResponse,
  ResellerSourceServicesResponse,
  ResellerSourceStoresResponse,
  ResellerSyncServicesResponse,
} from "../responses/reseller.response";

registry.registerPath({
  method: "get",
  path: "/reseller/providers",
  summary: "Get source providers for reseller discovery",
  tags: ["Reseller"],
  request: {
    query: SourceStoresQuerySchema,
  },
  responses: {
    200: ResellerSourceStoresResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/reseller/providers/{providerId}/services",
  summary: "Get source provider services",
  tags: ["Reseller"],
  request: {
    params: ProviderIdParamsSchema,
  },
  responses: {
    200: ResellerSourceServicesResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/internal/reseller/import-services",
  summary: "Internal: import source Social Media Services into authenticated target store",
  tags: ["Reseller"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResellerImportServicesSchema,
        },
      },
    },
  },
  responses: {
    200: ResellerImportServicesResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/internal/reseller/sync-services",
  summary: "Internal: sync source Social Media Services into authenticated target store",
  tags: ["Reseller"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResellerSyncServicesSchema,
        },
      },
    },
  },
  responses: {
    200: ResellerSyncServicesResponse,
    400: BadRequest,
    404: NotFound,
    500: ServerError,
  },
});
