import type { Request, Response } from "express";
import { CreatePaymentSchema } from "../schemas/payment.schema";
import * as paymentService from "../services/payment.services";

export const createPayment = async (req: Request, res: Response) => {
  const parsed = CreatePaymentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await paymentService.createPayment(parsed.data);
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};
