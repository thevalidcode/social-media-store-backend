import { registry } from "../components/registry";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

import {
  AdminOverviewResponse,
  AdminOrderStatsResponse,
  AdminPaymentStatsResponse,
  AdminUserStatsResponse,
  AdminServiceStatsResponse,
  UserDashboardResponse,
  UserOrderStatsResponse,
  UserPaymentStatsResponse,
  UserServiceStatsResponse,
} from "../responses/statistics.response";

// ======================= ADMIN ROUTES =======================

registry.registerPath({
  method: "get",
  path: "/statistics/admin/overview",
  summary: "Get admin overview statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminOverviewResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/admin/orders",
  summary: "Get admin order statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminOrderStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/admin/payments",
  summary: "Get admin payment statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminPaymentStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/admin/users",
  summary: "Get admin user statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminUserStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/admin/services",
  summary: "Get admin service statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminServiceStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// ======================= USER ROUTES =======================

registry.registerPath({
  method: "get",
  path: "/statistics/user/dashboard",
  summary: "Get user dashboard statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UserDashboardResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/user/orders",
  summary: "Get user order statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UserOrderStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/user/payments",
  summary: "Get user payment statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UserPaymentStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/statistics/user/services",
  summary: "Get user service usage statistics",
  tags: ["Statistics"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UserServiceStatsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
