import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "6060",
  DB_HOST: process.env.DB_HOST || "localhost",
  MASTER_KEY: process.env.MASTER_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  RATE_KEY: process.env.RATE_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  BACKEND_PROXY_PATH: process.env.BACKEND_PROXY_PATH || "",
};
