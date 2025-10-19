import { z } from "zod";
import { ServicePublicSchema } from "../../schemas/service.schema";

// ======================= SHARED SCHEMAS =======================

const CountByEnumSchema = z.object({
  status: z.string().optional(),
  role: z.string().optional(),
  type: z.string().optional(),
  serviceUid: z.string().optional(),
  _count: z.object({
    status: z.number().optional(),
    role: z.number().optional(),
    type: z.number().optional(),
    serviceUid: z.number().optional(),
  }),
});

const SumByEnumSchema = z.object({
  status: z.string(),
  _sum: z.object({
    amount: z.number().optional(),
  }),
});

// ======================= ADMIN RESPONSES =======================

export const AdminOverviewResponse = {
  description: "Admin overview statistics",
  content: {
    "application/json": {
      schema: z.object({
        totalOrders: z.number(),
        totalRevenue: z.number(),
        totalUsers: z.number(),
        totalServices: z.number(),
      }),
    },
  },
};

export const AdminOrderStatsResponse = {
  description: "Admin order statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        ordersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const AdminPaymentStatsResponse = {
  description: "Admin payment statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        paymentsByStatus: z.array(SumByEnumSchema),
      }),
    },
  },
};

export const AdminUserStatsResponse = {
  description: "Admin user statistics grouped by role and status",
  content: {
    "application/json": {
      schema: z.object({
        usersByRole: z.array(CountByEnumSchema),
        usersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const AdminServiceStatsResponse = {
  description: "Admin service statistics grouped by type and status",
  content: {
    "application/json": {
      schema: z.object({
        servicesByType: z.array(CountByEnumSchema),
        servicesByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

// ======================= USER RESPONSES =======================

export const UserDashboardResponse = {
  description: "User overview statistics",
  content: {
    "application/json": {
      schema: z.object({
        yourOrders: z.number(),
        yourSpent: z.number(),
        storeOrders: z.number(),
        ordersData: z.array(
          z.object({
            month: z.string(),
            orders: z.number(),
            completed: z.number(),
          })
        ),
        recentlyAddedServices: ServicePublicSchema,
        paymentsData: z.array(
          z.object({
            month: z.string(),
            successful: z.number(),
            failed: z.number(),
          })
        ),
      }),
    },
  },
};

export const UserOrderStatsResponse = {
  description: "User order statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        ordersByStatus: z.array(CountByEnumSchema),
      }),
    },
  },
};

export const UserPaymentStatsResponse = {
  description: "User payment statistics grouped by status",
  content: {
    "application/json": {
      schema: z.object({
        paymentsByStatus: z.array(SumByEnumSchema),
      }),
    },
  },
};

export const UserServiceStatsResponse = {
  description: "User service usage statistics grouped by service",
  content: {
    "application/json": {
      schema: z.object({
        serviceUsage: z.array(CountByEnumSchema),
      }),
    },
  },
};
