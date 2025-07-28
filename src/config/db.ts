import { Pool } from "pg";
import { env } from "./env";
import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export { pool, prisma };
