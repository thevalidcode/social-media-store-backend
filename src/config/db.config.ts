import { env } from "./env.config";
import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

export { prisma };
