import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import { randomUUID } from "crypto";
import mime from "mime-types";
import { env } from "../config/env.config";

const s3 = new S3Client({
  region: env.AWS_REGION!,
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
  const ext = path.extname(originalName);
  const mimeType = mime.lookup(ext) || "application/octet-stream";
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const key = `${storeId}/${collection}/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};
