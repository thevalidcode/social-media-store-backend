import type { Request, Response } from "express";
import {
  TransactionPublicSchema,
  TransactionSchema,
} from "../schemas/transaction.schema";
import { UserAuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getTransactionsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = UserAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId, user } = authParsed.data;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { storeId, userUid: user.uid },
      orderBy: { id: "desc" },
    });

    const parsedTransactions = transactions.map(
      (o) => TransactionPublicSchema.safeParse(o).data
    );
    res.status(200).json(parsedTransactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const transaction = await prisma.transaction.findMany({
      where: { storeId },
      orderBy: { id: "desc" },
    });

    const parsedTransactions = transaction.map(
      (o) => TransactionSchema.safeParse(o).data
    );
    res.status(200).json(parsedTransactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
