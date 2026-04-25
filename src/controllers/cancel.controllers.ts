import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  CancelUidSchema,
  UpdateCancelStatusSchema,
  ListCancelsByStatusSchema,
  CancelSchema,
} from "../schemas/cancel.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";

const publicFields = {
  storeScopedId: true,
  uid: true,
  status: true,
  timestamp: true,
  providerError: true,
  order: {
    select: {
      uid: true,
      storeScopedId: true,
      status: true,
      url: true,
    },
  },
};

const adminFields = {
  storeScopedId: true,
  uid: true,
  userUid: true,
  providerUid: true,
  status: true,
  timestamp: true,
  providerError: true,
  providerOrderId: true,
  orderUid: true,
  order: {
    select: {
      uid: true,
      storeScopedId: true,
      userUid: true,
      status: true,
      url: true,
    },
  },
};

export const getCancellations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const cancellations = await prisma.cancel.findMany({
      where: { storeId, userUid: user.uid },
      orderBy: { storeScopedId: "desc" },
      select: publicFields,
    });

    res.status(200).json(cancellations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCancellationsForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const cancellations = await prisma.cancel.findMany({
      where: { storeId },
      orderBy: { storeScopedId: "desc" },
      select: adminFields,
    });

    res.status(200).json(cancellations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCancellationByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  const parsed = CancelUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId, user } = authParsed.data;
  const { cancelUid } = parsed.data;

  try {
    const cancellation = await prisma.cancel.findFirst({
      where: { uid: cancelUid, storeId, userUid: user.uid },
      select: publicFields,
    });

    if (!cancellation) {
      res.status(404).json({ error: "Cancellation not found" });
      return;
    }

    res.status(200).json(cancellation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCancellationByUidForAdmins = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = CancelUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { cancelUid } = parsed.data;

  try {
    const cancellation = await prisma.cancel.findFirst({
      where: { uid: cancelUid, storeId },
      select: adminFields,
    });

    if (!cancellation) {
      res.status(404).json({ error: "Cancellation not found" });
      return;
    }

    res.status(200).json(cancellation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCancellationsByStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = ListCancelsByStatusSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { status } = parsed.data;

  try {
    const cancellations = await prisma.cancel.findMany({
      where: { storeId, status },
      orderBy: { storeScopedId: "desc" },
      select: adminFields,
    });

    res.status(200).json(cancellations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCancellationStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = UpdateCancelStatusSchema.safeParse(req.body);
  const paramsSchema = CancelUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success || !paramsSchema.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
        ...paramsSchema.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { cancelUid } = paramsSchema.data;
  const { status, providerError } = parsed.data;

  try {
    const cancellation = await prisma.cancel.findFirst({
      where: { uid: cancelUid, storeId },
    });

    if (!cancellation) {
      res.status(404).json({ error: "Cancellation not found" });
      return;
    }

    const updated = await prisma.cancel.update({
      where: { uid: cancelUid },
      data: { status, providerError: providerError || null },
      select: adminFields,
    });

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCancellation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = CancelUidSchema.safeParse(req.params);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        ...authParsed.error?.flatten(),
        ...parsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;
  const { cancelUid } = parsed.data;

  try {
    const cancellation = await prisma.cancel.findFirst({
      where: { uid: cancelUid, storeId },
    });

    if (!cancellation) {
      res.status(404).json({ error: "Cancellation not found" });
      return;
    }

    await prisma.cancel.delete({
      where: { uid: cancelUid },
    });

    res.status(200).json({ success: "Cancellation deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
