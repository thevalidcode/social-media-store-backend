import type { Request, Response } from "express";
import paymentService from "../services/payment.services";
import {
  FlutterwaveWebhookSchema,
  PaystackWebhookSchema,
} from "../schemas/webhook.schema";

export const flutterwaveWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = FlutterwaveWebhookSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const event = parsed.data;
    if (event.event === "charge.completed") {
      await paymentService.handleFlutterwaveSuccess(
        req,
        event,
        event.data.customer
      );
    } else if (
      ["charge.failed", "charge.reversed", "charge.cancelled"].includes(
        event.event
      )
    ) {
      await paymentService.handleFlutterwaveFailure(
        req,
        event,
        event.data.customer
      );
    } else {
      console.log("Unhandled event:", event.event);
    }

    res.sendStatus(200);
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};

export const paystackWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = PaystackWebhookSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const event = parsed.data;
    if (event.event === "charge.success") {
      await paymentService.handlePaystackSuccess(
        req,
        event.data,
        event.data.customer
      );
    } else if (["charge.failed", "charge.reversed"].includes(event.event)) {
      await paymentService.handlePaystackFailure(
        req,
        event.data,
        event.data.customer
      );
    } else {
      console.log("Unhandled event:", event.event);
    }

    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
