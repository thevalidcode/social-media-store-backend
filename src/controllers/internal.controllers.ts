import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  createStoreSchema,
  PaginationQuerySchema,
  UidSchema,
  UpdateStoreSchema,
} from "../schemas/internal.schema";
import { CreateStore, DeleteStore } from "../services/store";
import { StoreError } from "../errors/store.error";

/**
 * Standardized error response format for API callers
 */
const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: any
) => {
  res.status(statusCode).json({
    error: {
      message,
      code: code || "UNKNOWN_ERROR",
      ...(details && { details }),
    },
  });
};

export const getOrdersForInternalAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      sendErrorResponse(
        res,
        400,
        "Invalid pagination parameters",
        "VALIDATION_ERROR",
        parsed.error.flatten()
      );
      return;
    }

    const { page, limit } = parsed.data;

    const skip = (page - 1) * limit;

    // Count total orders
    const total = await prisma.order.count();

    // Fetch paginated orders
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        user: true,
      },
    });

    res.status(200).json({
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    sendErrorResponse(res, 500, "Failed to fetch orders", "DATABASE_ERROR");
  }
};

export const createStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid store creation parameters",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }

  try {
    const result = await CreateStore(parsed.data);
    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error creating store:", err);

    if (err instanceof StoreError) {
      const statusCode =
        err.code === "DOMAIN_TAKEN" || err.code === "ADMIN_EMAIL_TAKEN"
          ? 409
          : err.code === "CLI_ERROR"
            ? 500
            : 400;

      sendErrorResponse(res, statusCode, err.message, err.code);
    } else {
      sendErrorResponse(res, 500, "Failed to create store", "DATABASE_ERROR");
    }
  }
};

export const deleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid store UID",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }
  const { uid } = parsed.data;
  try {
    const store = await prisma.store.findUnique({ where: { uid } });

    if (!store) {
      sendErrorResponse(res, 404, "Store not found", "STORE_NOT_FOUND");
      return;
    }

    await DeleteStore({ uid });
    res.json({
      success: true,
      message: "Store deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting store:", err);

    if (err instanceof StoreError) {
      sendErrorResponse(res, 500, err.message, err.code);
    } else {
      sendErrorResponse(res, 500, "Failed to delete store", "DATABASE_ERROR");
    }
  }
};

export const updateStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid store UID",
      "VALIDATION_ERROR",
      paramsParsed.error.flatten()
    );
    return;
  }
  const { uid } = paramsParsed.data;

  const parsed = UpdateStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      400,
      "Invalid store update parameters",
      "VALIDATION_ERROR",
      parsed.error.flatten()
    );
    return;
  }
  try {
    const store = await prisma.store.findUnique({ where: { uid } });

    if (!store) {
      sendErrorResponse(res, 404, "Store not found", "STORE_NOT_FOUND");
      return;
    }

    await prisma.setting.upsert({
      where: {
        storeId: store.storeId,
      },
      create: {
        ...parsed.data,
        storeId: store.storeId,
      },
      update: {
        ...parsed.data,
      },
    });

    await prisma.store.update({
      where: {
        uid,
      },
      data: {
        name: parsed.data.storeName,
        description: parsed.data.storeDescription,
      },
    });
    res.json({
      success: true,
      message: "Store updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating store:", err);
    sendErrorResponse(res, 500, "Failed to update store", "DATABASE_ERROR");
  }
};
