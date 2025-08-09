import crypto from "crypto";
import type { Request } from "express";

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackSignature(
  req: Request,
  secretKey: string
): boolean {
  const computedHash = crypto
    .createHmac("sha512", secretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(String(req.headers["x-paystack-signature"] || ""))
  );
}

/**
 * Verify Flutterwave webhook signature
 */
export function verifyFlutterwaveSignature(
  req: Request,
  secretHash: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(String(req.headers["verif-hash"] || "")),
    Buffer.from(secretHash)
  );
}
