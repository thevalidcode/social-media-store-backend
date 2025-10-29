import axios from "axios";
import https from "https";
import { prisma } from "../config/db.config";
import { sendEmail } from "../emails";
import { decryptKey } from "../utils/encrypt";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const agent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});

const safeInt = (n: any, d = 0): number =>
  Number.isFinite(+n) ? parseInt(n, 10) : d;

export const sendRefillToMainServer = async (
  orderUid: string,
  storeId: number
): Promise<boolean> => {
  try {
    const order = await prisma.order.findFirst({
      where: { uid: orderUid, storeId },
    });

    if (!order) return false;

    const provider = await prisma.provider.findFirst({
      where: { url: order.provider || "", storeId },
    });

    if (!provider) return false;

    const apiKeyData = provider.apiKey as {
      encrypted_key: string;
      iv: string;
    };

    const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

    const { data: res } = await axios.post(
      `https://${provider.url}`,
      { key: decryptedKey, action: "refill", order: order.providerOrderId },
      { httpsAgent: agent }
    );

    if (res.error) {
      try {
        await sendEmail(
          undefined,
          "NEWFAILEDREFILL",
          {
            orderId: order.id,
            quantity: order.quantity,
            price: order.price,
            provider: order.provider,
            error: res.error,
          },
          storeId
        );
      } catch (e: any) {
        console.error("Email error (failed refill):", e.message);
      }
      return false;
    }

    // Transaction: create refill and update its status
    const [refill] = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { refillCounter: { increment: 1 } },
      });

      const refillRow = await tx.refill.create({
        data: {
          providerId: safeInt(res.refill),
          provider: order.provider || "",
          orderUid: order.uid,
          storeScopedId: counter.refillCounter,
          userUid: order.userUid,
          providerOrderId: safeInt(res.order),
          uid: uuidv4(),
          storeId,
        },
      });

      const updated = await updateRefillStatusTx(refillRow.uid, storeId, tx);

      return [refillRow, updated];
    });

    try {
      await sendEmail(
        undefined,
        "NEWREFILL",
        {
          orderId: order.id,
          number: order.quantity,
          price: order.price,
          provider: order.provider,
        },
        storeId
      );
    } catch (e: any) {
      console.error("Email error (new refill):", e.message);
    }

    return true;
  } catch (err: any) {
    console.error("Error sending refill to main server:", err.message);
    return false;
  }
};

export const updateRefillStatus = async (
  refillUid: string,
  storeId: number
): Promise<boolean> => {
  try {
    return await prisma.$transaction(async (tx) => {
      return updateRefillStatusTx(refillUid, storeId, tx);
    });
  } catch (err: any) {
    console.error("Error updating refill:", err.message);
    return false;
  }
};

const updateRefillStatusTx = async (
  refillUid: string,
  storeId: number,
  tx: Prisma.TransactionClient
): Promise<boolean> => {
  const refill = await tx.refill.findFirst({
    where: { uid: refillUid, storeId },
  });

  if (!refill) return false;

  const provider = await tx.provider.findFirst({
    where: { url: refill.provider, storeId },
  });

  if (!provider) return false;

  const apiKeyData = provider.apiKey as {
    encrypted_key: string;
    iv: string;
  };

  const decryptedKey = decryptKey(apiKeyData.encrypted_key, apiKeyData.iv);

  const { data: res } = await axios.post(
    `https://${provider.url}`,
    { key: decryptedKey, action: "refill_status", refill: refill.providerId },
    { httpsAgent: agent }
  );

  if (res.error) {
    await tx.refill.update({
      where: { uid: refillUid },
      data: { providerError: res.error },
    });
    return false;
  }

  await tx.refill.update({
    where: { uid: refillUid },
    data: { status: res.status },
  });

  return true;
};
