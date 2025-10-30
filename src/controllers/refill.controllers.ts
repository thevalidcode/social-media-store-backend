import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { UserAuthSchema } from "../schemas/user.schema";
import {
  placeRefillSchema,
  updateRefillSchema,
  bulkCreateRefillSchema,
  bulkStatusUpdateRefillSchema,
  getRefillsByStatusSchema,
  RefillPublicSchema,
  RefillSchema,
} from "../schemas/refill.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getRefills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const refills = await prisma.refill.findMany({
      where: { storeId, userUid: user.uid },
      orderBy: { id: "desc" },
    });

    const parsedRefills = refills.map(
      (r) => RefillPublicSchema.safeParse(r).data
    );
    res.status(200).json(parsedRefills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefillsForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const refills = await prisma.refill.findMany({
      where: { storeId },
      orderBy: { id: "desc" },
    });

    const parsedRefills = refills.map((r) => RefillSchema.safeParse(r).data);
    res.status(200).json(parsedRefills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefillById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const { refillUid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, type, user } = authParsed.data;

  try {
    const refill = await prisma.refill.findFirst({
      where: {
        uid: refillUid,
        storeId,
        ...(type === "user" ? { userUid: user.uid } : {}),
      },
    });

    if (!refill) {
      res.status(404).json({ error: "Refill not found" });
      return;
    }

    const parsedRefill =
      type === "user"
        ? RefillPublicSchema.safeParse(refill)
        : RefillSchema.safeParse(refill);

    res.status(200).json(parsedRefill.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const placeRefill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = placeRefillSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !parsed.success ? parsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const reqData = parsed.data;

  try {
    const newRefill = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { refillCounter: { increment: 1 } },
      });

      const refill = await tx.refill.create({
        data: {
          ...reqData,
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.refillCounter,
          userUid: user.uid,
          providerId: 1, // Assuming a default provider ID, adjust as necessary
          providerOrderId: 1, // Assuming a default provider order ID, adjust as necessary
        },
      });

      return refill;
    });

    res.status(200).json({
      success: "Refill placed successfully",
      uid: newRefill.uid,
    });
  } catch (error: any) {
    console.error("Failed to place refill:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateRefill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = updateRefillSchema.safeParse(req.body);
  const { refillUid } = req.params;

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !parsed.success ? parsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await prisma.refill.updateMany({
      where: { uid: refillUid, storeId },
      data: parsed.data.update,
    });

    res.status(200).json({ success: "Refill updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRefill = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const { refillUid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await prisma.refill.deleteMany({
      where: { uid: refillUid, storeId },
    });

    res.status(200).json({ success: "Refill deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefillsByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = getRefillsByStatusSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !parsed.success ? parsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId, type, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const refills = await prisma.refill.findMany({
      where: {
        storeId,
        ...(type === "user" ? { userUid: user.uid } : {}),
        ...(status !== "all" ? { status } : {}),
      },
      orderBy: { id: "desc" },
    });

    const parsedRefills =
      type === "user"
        ? refills.map((r) => RefillPublicSchema.safeParse(r).data)
        : refills.map((r) => RefillSchema.safeParse(r).data);

    res.status(200).json(parsedRefills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkCreateRefills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = bulkCreateRefillSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !parsed.success ? parsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const counter = await prisma.storeCounter.update({
      where: { storeId },
      data: { refillCounter: { increment: parsed.data.refills.length } }, // Adjust counter type
    });

    const baseCount = counter.refillCounter - parsed.data.refills.length;

    const created = await Promise.all(
      parsed.data.refills.map((refill: any, index: number) =>
        prisma.refill.create({
          data: {
            ...refill,
            uid: uuidv4(),
            storeId,
            storeScopedId: baseCount + index + 1,
            userUid: user.uid,
          },
        })
      )
    );

    const uids = created.map((r) => r.uid);
    res.status(200).json({ success: "Bulk refills created", uids });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUpdateRefillStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = bulkStatusUpdateRefillSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !parsed.success ? parsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    await prisma.$transaction(
      parsed.data.updates.map((update) =>
        prisma.refill.updateMany({
          where: {
            uid: update.uid,
            storeId,
          },
          data: {
            status: update.status,
          },
        })
      )
    );

    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    console.error("Bulk update failed:", error);
    res.status(500).json({ error: error.message });
  }
};
