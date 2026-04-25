import { Request, Response } from "express";
import { z } from "zod";
import {
  CreateServiceRatingSchema,
  UpdateServiceRatingSchema,
  ApproveServiceRatingSchema,
} from "../schemas/serviceRating.schema";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { UidSchema } from "../schemas/common.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";

/**
 * CREATE SERVICE RATING
 * POST /v1/service-ratings
 * Creates a new rating for a service
 */
export const createServiceRating = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = CreateServiceRatingSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const { serviceUid, rating, review } = parsed.data;

  try {
    // Verify service exists in store
    const service = await prisma.service.findFirst({
      where: { uid: serviceUid, storeId },
      select: { uid: true },
    });

    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    // User must have ordered this service before being allowed to review it.
    const hasOrderedService = await prisma.order.findFirst({
      where: {
        storeId,
        userUid: user.uid,
        serviceUid,
      },
      select: { uid: true },
    });

    if (!hasOrderedService) {
      res.status(403).json({
        error: "You can only review services you have ordered",
      });
      return;
    }

    // Check if user already rated this service
    const existingRating = await prisma.serviceRating.findUnique({
      where: {
        serviceUid_userUid_storeId: {
          serviceUid,
          userUid: user.uid,
          storeId,
        },
      },
    });

    if (existingRating) {
      res.status(409).json({ error: "You have already rated this service" });
      return;
    }

    // Create rating with transaction to get storeScopedId
    const newRating = await prisma.$transaction(
      async (tx) => {
        const counter = await tx.storeCounter.update({
          where: { storeId },
          data: { ratingCounter: { increment: 1 } },
        });

        return tx.serviceRating.create({
          data: {
            uid: uuidv4(),
            storeScopedId: counter.ratingCounter,
            serviceUid,
            userUid: user.uid,
            rating,
            review: review || null,
            status: "PENDING",
            storeId,
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    res.status(201).json({ data: newRating });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * GET SERVICE RATINGS (PUBLIC)
 * GET /v1/service-ratings/:serviceUid/public
 * Gets approved ratings for a service (public view, no auth required)
 */
export const getServiceRatings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = z
    .object({
      serviceUid: z.string().uuid("Service UID must be a valid UUID"),
    })
    .safeParse(req.params);

  const queryParsed = z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    })
    .safeParse(req.query);

  if (!parsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...queryParsed.error?.flatten(),
      },
    });
    return;
  }

  const { serviceUid } = parsed.data;
  const { page, limit } = queryParsed.data;

  try {
    const ratings = await prisma.serviceRating.findMany({
      where: {
        serviceUid,
        status: "APPROVED",
      },
      select: {
        uid: true,
        rating: true,
        review: true,
        timestamp: true,
      },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.serviceRating.count({
      where: {
        serviceUid,
        status: "APPROVED",
      },
    });

    const averageRating = await prisma.serviceRating.aggregate({
      where: {
        serviceUid,
        status: "APPROVED",
      },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      data: {
        ratings,
        pagination: {
          page,
          limit,
          total,
        },
        stats: {
          averageRating: averageRating._avg.rating || 0,
          totalRatings: averageRating._count,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * GET PENDING RATINGS (ADMIN)
 * GET /v1/service-ratings/admin/pending
 * Gets pending ratings for admin approval
 */
export const getPendingRatings = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  const queryParsed = z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...queryParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { page, limit } = queryParsed.data;

  try {
    const ratings = await prisma.serviceRating.findMany({
      where: {
        storeId,
        status: "PENDING",
      },
      include: {
        service: { select: { name: true, uid: true } },
      },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.serviceRating.count({
      where: {
        storeId,
        status: "PENDING",
      },
    });

    res.json({
      data: {
        ratings,
        pagination: {
          page,
          limit,
          total,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * APPROVE/REJECT RATING (ADMIN)
 * PATCH /v1/service-ratings/:uid/approve
 * Approves or rejects a pending rating
 */
export const approveServiceRating = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = UidSchema.safeParse(req.params);
  const bodyParsed = ApproveServiceRatingSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...paramsParsed.error?.flatten(),
        ...bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = paramsParsed.data;
  const { status } = bodyParsed.data;

  try {
    // Verify rating exists and belongs to store
    const rating = await prisma.serviceRating.findFirst({
      where: { uid, storeId },
      select: { uid: true },
    });

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    const updated = await prisma.serviceRating.update({
      where: { uid },
      data: { status },
    });

    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * UPDATE SERVICE RATING (USER)
 * PATCH /v1/service-ratings/:uid
 * Users can update their own rating
 */
export const updateServiceRating = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = UidSchema.safeParse(req.params);
  const bodyParsed = UpdateServiceRatingSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...paramsParsed.error?.flatten(),
        ...bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    // Verify rating belongs to user and exists in store
    const rating = await prisma.serviceRating.findFirst({
      where: { uid, storeId, userUid: user.uid },
      select: { uid: true },
    });

    if (!rating) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const updated = await prisma.serviceRating.update({
      where: { uid },
      data: bodyParsed.data,
    });

    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * DELETE SERVICE RATING (USER)
 * DELETE /v1/service-ratings/:uid
 * Users can delete their own rating
 */
export const deleteServiceRating = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const paramsParsed = UidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    // Verify rating exists in store
    const rating = await prisma.serviceRating.findFirst({
      where: { uid, storeId },
      select: { userUid: true },
    });

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    // Check authorization: user must own it or be admin
    if (rating.userUid !== user.uid) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    await prisma.serviceRating.delete({
      where: { uid },
    });

    res.json({ data: { success: true } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * DELETE SERVICE RATING (ADMIN)
 * DELETE /v1/service-ratings/admin/:uid
 * Admins can delete any
 */
export const deleteServiceRatingForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = UidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    // Verify rating exists in store
    const rating = await prisma.serviceRating.findFirst({
      where: { uid, storeId },
      select: { userUid: true },
    });

    if (!rating) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    await prisma.serviceRating.delete({
      where: { uid },
    });

    res.json({ data: { success: true } });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
