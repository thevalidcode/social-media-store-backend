import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { PaginationQuerySchema } from "../schemas/internal.schema";

/**
 * 📦 Get all orders (for internal admins)
 * Supports pagination with `?page=1&limit=20`
 */
export const getOrdersForInternalAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parsed = PaginationQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
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
    res.status(500).json({ error: error.message });
  }
};
