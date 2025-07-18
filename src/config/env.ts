import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "6060",
  DB_HOST: process.env.DB_HOST || "localhost",
  MASTER_KEY: process.env.MASTER_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  DB_PORT: process.env.DB_PORT || "5432",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "",
  DB_USER: process.env.DB_USER || "",
  RATE_KEY: process.env.RATE_KEY || "",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
  AWS_REGION: process.env.AWS_REGION || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
};
