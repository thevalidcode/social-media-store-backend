import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import mime from "mime-types";
import { env } from "../config/env.config";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (
  buffer: Buffer,
  originalName: string,
  storeId: number,
  collection: string
): Promise<string> => {
  const ext = path.extname(originalName).toLowerCase();
  const mimeType = mime.lookup(ext) || "application/octet-stream";

  // Compute file hash
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Use hash as filename to prevent duplicates
  const key = `${storeId}/${collection}/${hash}${ext}`;

  // Check if already exists
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      })
    );

    // If exists, return existing URL
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (_) {
    // Not found, upload new file
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
  }

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};
