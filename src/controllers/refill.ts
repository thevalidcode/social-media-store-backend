import type { Request, Response } from "express";
import { getDocs, addStoreDoc, updateStoreDoc, deleteStoreDoc } from "../crud";
import { AuthSchema } from "../schemas/user.schema";
import {
  placeRefillSchema,
  updateRefillSchema,
  bulkCreateRefillSchema,
  bulkStatusUpdateRefillSchema,
  getRefillsByStatusSchema,
  RefillPublicSchema,
  RefillSchema,
} from "../schemas/refill.schema";

export const getRefills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id, user } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }
  try {
    const refills = await getDocs("refills", store_id, {
      filter: { user_uid: user.uid },
    });
    const sorted = refills.sort((a: any, b: any) => b.id - a.id);
    const parsedRefills = sorted.map(
      (r: any) => RefillPublicSchema.safeParse(r).data
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
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    const refills = await getDocs("refills", store_id);
    const sorted = refills.sort((a: any, b: any) => b.id - a.id);
    const parsedRefills = sorted.map(
      (r: any) => RefillSchema.safeParse(r).data
    );
    res.status(200).json(parsedRefills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefilByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const { refill_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id, user } = authParsed.data;

  try {
    const refil = await getDocs("refills", store_id, {
      find: {
        uid: refill_uid,
        user_uid: user.uid,
      },
    });

    if (!refil) {
      res.status(404).json({ error: "Refil not found" });
      return;
    }

    const parsedRefil =
      role === "user"
        ? RefillPublicSchema.safeParse(refil)
        : RefillSchema.safeParse(refil);
    res.status(200).json(parsedRefil.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const placeRefil = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = placeRefillSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { store_id, role } = authParsed.data;
  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  const reqData = parsed.data;

  try {
    const newRefil = await addStoreDoc("refills", reqData, store_id);
    res
      .status(200)
      .json({ success: "Refil placed successfully", uid: newRefil.uid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRefil = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = updateRefillSchema.safeParse(req.body);
  const { refill_uid } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await updateStoreDoc("refills", refill_uid, parsed.data.update, store_id);
    res.status(200).json({ success: "Refil updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRefil = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const { refill_uid } = req.params;

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await deleteStoreDoc("refills", refill_uid, store_id);
    res.status(200).json({ success: "Refil deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRefillsByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = getRefillsByStatusSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { store_id, role, user } = authParsed.data;
  const { status } = parsed.data;

  try {
    const allRefills = await getDocs(
      "refills",
      store_id,
      role === "user"
        ? {
            filter: { user_uid: user.uid },
            removeKeys: ["provider", "provider_refil_id", "provider_error"],
          }
        : undefined
    );

    const filtered =
      status === "all"
        ? allRefills
        : allRefills.filter((r: any) => r.status === status);

    const parsedRefills =
      role === "user"
        ? filtered.map((r: any) => RefillPublicSchema.safeParse(r).data)
        : filtered.map((r: any) => RefillSchema.safeParse(r).data);

    res.status(200).json(parsedRefills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkCreateRefills = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkCreateRefillSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;

  if (role !== "user") {
    res.status(403).json({ error: "Access denied, Users only." });
    return;
  }

  try {
    const results = await Promise.all(
      parsed.data.refills.map((refil: any) =>
        addStoreDoc("refills", refil, store_id)
      )
    );
    const uids = results.map((r: any) => r.uid);
    res.status(200).json({ success: "Bulk refills created", uids });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bulkUpdateRefillStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = bulkStatusUpdateRefillSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { role, store_id } = authParsed.data;
  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await Promise.all(
      parsed.data.updates.map((update: any) =>
        updateStoreDoc(
          "refills",
          update.uid,
          { status: update.status },
          store_id
        )
      )
    );
    res.status(200).json({ success: "Bulk status update completed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
