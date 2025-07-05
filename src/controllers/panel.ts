import { z } from "zod";
import { getDocs } from "../crud";
import type { Request, Response } from "express";

const panelIdQuerySchema = z.object({ domain: z.string().min(1) });
const panelIdSchema = z.object({ panel_id: z.coerce.number() });
const uidQuerySchema = z.object({ uid: z.string().min(1) });

export const getPanelData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = panelIdQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { domain } = parsed.data;

  try {
    const panels = await getDocs("panels");
    const panel = panels.find((p: any) => p.uid === domain);
    if (!panel) {
      res.status(404).json({ error: "Panel not found for the given domain" });
      return;
    }
    res.json({
      panel_id: panel.panel_id,
      plan: panel.plan,
      timestamp: panel.timestamp,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getStyles = async (req: Request, res: Response): Promise<void> => {
  const parsed = panelIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id } = parsed.data;

  try {
    const result = await getDocs("design_styles", panel_id);
    res.json(result[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSiteData = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = panelIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { panel_id } = parsed.data;

  try {
    const result = await getDocs("general", panel_id, {
      find: { field: "uid", operator: "===", value: "site" },
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getRates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await getDocs("currencies", 1);
    res.json(result[0].quotes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { panel_id } = req.auth;

  const parsed = uidQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;

  try {
    const result = await getDocs("users", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!result) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized: auth info missing" });
    return;
  }
  const { panel_id, role } = req.auth;

  if (role !== "admin") {
    res.status(403).json({ error: "Access denied. Admins only." });
    return;
  }

  const parsed = uidQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;

  try {
    const result = await getDocs("admins", panel_id, {
      find: { field: "uid", operator: "===", value: uid },
      removeKeys: ["password"],
    });
    if (!result) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
