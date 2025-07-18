import { addStoreDoc, getDocs } from "../crud";
import type { Request, Response } from "express";
import { UploadImageRequest, FileSchema } from "../schemas/files.schema";
import { AuthSchema } from "../schemas/user.schema";
import { uploadToS3 } from "../services/s3.services";

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

    const authResult = AuthSchema.safeParse(req.auth);
    if (!authResult.success) {
      res.status(400).json({ error: authResult.error.flatten() });
      return;
    }

    const bodyResult = UploadImageRequest.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const { role, store_id } = authResult.data;
    const { collection } = bodyResult.data;

    if (role !== "admin") {
      res.status(403).json({ error: "Access denied. Admins only." });
      return;
    }

    const store = await getDocs("stores", store_id);
    if (!store || !store.length) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const safeName = req.file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const buffer = req.file.buffer;
    const s3Url = await uploadToS3(buffer, safeName, store_id, collection);

    if (!s3Url) {
      res.status(500).json({ error: "Failed to upload image to S3" });
      return;
    }

    await addStoreDoc(
      "upload_logs",
      {
        filename: safeName,
        url: s3Url,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      store_id
    );

    res.status(200).json({
      message: "Image uploaded successfully",
      url: s3Url,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
