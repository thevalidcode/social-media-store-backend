import type { Request, Response } from "express";
import { UploadImageRequest, FileSchema } from "../schemas/files.schema";
import { uploadToS3 } from "../services/s3.services";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const fileResult = FileSchema.safeParse(req.file);
    if (!fileResult.success) {
      res.status(400).json({ error: fileResult.error.format() });
      return;
    }

    const authResult = req.auth!;

    const bodyResult = UploadImageRequest.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const { storeId } = authResult;
    const { collection } = bodyResult.data;

    const store = await prisma.store.findUnique({
      where: { storeId },
    });

    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const safeName = req.file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const buffer = req.file.buffer;
    const s3Url = await uploadToS3(buffer, safeName, storeId, collection);

    if (!s3Url) {
      res.status(500).json({ error: "Failed to upload image to S3" });
      return;
    }

    const uploadLog = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { uploadLogCounter: { increment: 1 } },
      });

      const log = await tx.uploadLog.create({
        data: {
          uid: uuidv4(),
          storeId,
          storeScopedId: counter.uploadLogCounter,
          filename: safeName,
          url: s3Url,
          mimetype: req.file?.mimetype || "application/octet-stream",
          size: req.file?.size || 0,
        },
      });

      return log;
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      url: uploadLog.url,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
