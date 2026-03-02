import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Define schema
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PRIMARY_PORT: z.string().default("6060"),
  DB_HOST: z.string().default("localhost"),
  MASTER_KEY: z.string(),
  JWT_SECRET: z.string(),
  INTERNAL_SERVICE_JWT_SECRET: z.string(),
  DATABASE_URL: z.string().url().default(""),
  SESSION_SECRET: z.string(),
  ADMIN_USERNAME: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  ADMIN_PASSWORD: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_REGION: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  CORE_PLATFORM_BACKEND_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
});

// Parse and validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
