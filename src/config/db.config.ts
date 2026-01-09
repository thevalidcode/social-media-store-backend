import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.config";

let prismaClient: PrismaClient;

export function getPrismaClient() {
  if (!prismaClient) {
    const { DATABASE_URL } = env;

    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
    });

    prismaClient = new PrismaClient({ adapter });
  }

  return prismaClient;
}

export const prisma = getPrismaClient();
