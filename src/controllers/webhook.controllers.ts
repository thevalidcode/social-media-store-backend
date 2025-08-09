import type { Request, Response } from "express";
import paymentService from "../services/payment.services";
import {
  verifyPaystackSignature,
  verifyFlutterwaveSignature,
} from "../utils/webhook/verifySignatures";
import {
  FlutterwaveWebhookSchema,
  PaystackWebhookSchema,
} from "../schemas/webhook.schema";
import { prisma } from "../config/db";
import { decryptKey } from "../utils/encrypt";

export const flutterwaveWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = FlutterwaveWebhookSchema.safeParse(req.body);
  const { storeId } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const gateway = await prisma.paymentGateway.findFirst({
    where: { storeId: Number(storeId), platform: "PAYSTACK" },
  });

  if (!gateway || !gateway.signature) {
    res.status(400).json({ error: "Invalid store or missing signature" });
    return;
  }

  if (!verifyFlutterwaveSignature(req, gateway.signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  try {
    const event = parsed.data;
    if (event.status === "successful") {
      await paymentService.handleFlutterwaveSuccess(
        event,
        event.customer,
        Number(storeId)
      );
    } else if (["failed", "reversed", "cancelled"].includes(event.status)) {
      await paymentService.handleFlutterwaveFailure(
        event,
        event.customer,
        Number(storeId)
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
  const { storeId } = req.params;

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const gateway = await prisma.paymentGateway.findFirst({
    where: { storeId: Number(storeId), platform: "PAYSTACK" },
  });

  if (!gateway || !gateway.secretKey) {
    res.status(400).json({ error: "Invalid store or missing signature" });
    return;
  }
  const signature = gateway.secretKey as {
    encrypted_key: string;
    iv: string;
  };

  const decryptedKey = decryptKey(signature.encrypted_key, signature.iv);
  if (!verifyPaystackSignature(req, decryptedKey)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  try {
    const event = parsed.data;
    if (event.event === "charge.success") {
      await paymentService.handlePaystackSuccess(
        event.data,
        event.data.customer,
        Number(storeId)
      );
    } else if (["charge.failed", "charge.reversed"].includes(event.event)) {
      await paymentService.handlePaystackFailure(
        event.data,
        event.data.customer,
        Number(storeId)
      );
    } else {
      console.log("Unhandled event:", event.event);
    }

    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
