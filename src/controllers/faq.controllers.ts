import { Request, Response } from "express";
import {
  createFAQSchema,
  updateFAQSchema,
  deleteFAQSchema,
  faqIdSchema,
  deleteMultipleFAQsSchema,
} from "../schemas/faq.schema";
import { StoreIdSchema } from "../schemas/common.schema";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export const getFAQs = async (req: Request, res: Response): Promise<void> => {
  const parsed = StoreIdSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { storeId } = parsed.data;

  try {
    const faqs = await prisma.faq.findMany({
      where: { storeId },
      orderBy: { position: "asc" },
    });

    res.status(200).json(faqs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFAQByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = faqIdSchema.safeParse(req.params);
  const queryParsed = StoreIdSchema.safeParse(req.query);

  if (!parsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...queryParsed.error?.flatten(),
      },
    });
    return;
  }

  const { faqId } = parsed.data;
  const { storeId } = queryParsed.data;

  try {
    const faq = await prisma.faq.findFirst({
      where: { id: faqId, storeId },
    });

    res.status(200).json({ faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = createFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { storeId } = authParsed.data;

  try {
    const faqExists = await prisma.faq.findFirst({
      where: {
        storeId,
        question: parsed.data.question.toLowerCase(),
      },
    });

    if (faqExists) {
      res
        .status(400)
        .json({ error: "FAQ already exists, try creating a new one." });
      return;
    }

    const newFAQ = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { faqCounter: { increment: 1 } },
      });

      const lastFAQ = await tx.faq.findFirst({
        where: { storeId },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      const newPosition = lastFAQ ? lastFAQ.position + 1 : 1;

      const faq = await tx.faq.create({
        data: {
          question: parsed.data.question,
          answer: parsed.data.answer,
          status: "active",
          position: newPosition,
          uid: uuidv4(),
          slug: parsed.data.question.toLowerCase().replace(/\s+/g, "-"),
          storeId,
          storeScopedId: counter.faqCounter,
        },
      });

      return faq;
    });

    res.status(200).json({
      success: "FAQ added successfully.",
      faq: newFAQ,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid, question } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    const updateData = {
      ...parsed.data,
      ...(question && {
        slug: question.toLowerCase().replace(/\s+/g, "-"),
      }),
    };

    await prisma.faq.update({
      where: { uid, storeId },
      data: updateData,
    });

    const faq = await prisma.faq.findFirst({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "FAQ updated successfully.", faq });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFAQ = async (req: Request, res: Response): Promise<void> => {
  const parsed = deleteFAQSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.faq.delete({
      where: { uid, storeId },
    });

    res.status(200).json({ success: "FAQ deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMultipleFAQs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteMultipleFAQsSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        ...parsed.error?.flatten(),
        ...authParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uids } = parsed.data;
  const { storeId } = authParsed.data;

  try {
    await prisma.faq.deleteMany({
      where: {
        uid: { in: uids },
        storeId,
      },
    });

    res.status(200).json({ success: "FAQs deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};