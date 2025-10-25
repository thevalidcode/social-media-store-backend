import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";
import {
  CreateSupportTicketSchema,
  GetSupportTicketByUidSchema,
  UpdateSupportTicketSchema,
  DeleteSupportTicketSchema,
  CreateTicketMessageSchema,
  DeleteTicketMessageSchema,
} from "../schemas/support.schema";
import { v4 as uuidv4 } from "uuid";

export const getAllTickets = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        messages: true,
      },
    });

    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTicketsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = authParsed.data;

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userUid: uid },
      orderBy: { createdAt: "desc" },
      select: {
        uid: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {
            uid: true,
            message: true,
            senderType: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = CreateSupportTicketSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { storeId, uid } = authParsed.data;
  const reqData = bodyParsed.data;

  try {
    const ticket = await prisma.$transaction(async (tx) => {
      const counter = await tx.storeCounter.update({
        where: { storeId },
        data: { supportTicketCounter: { increment: 1 } },
      });

      const newTicket = await tx.supportTicket.create({
        data: {
          storeId,
          userUid: uid,
          storeScopedId: counter.supportTicketCounter,
          description: reqData.description,
          status: "OPEN",
          subject: reqData.subject,
          priority: reqData.priority,
          messages: {
            create: {
              uid: uuidv4(),
              senderUid: uid,
              message: reqData.message,
              senderType: "USER",
            },
          },
        },
      });

      return newTicket;
    });

    res.status(200).json({
      success: "Ticket created successfully",
      uid: ticket.uid,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid: userUid } = authParsed.data;
  const { uid } = paramsParsed.data;

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { uid, userUid },
      select: {
        uid: true,
        subject: true,
        description: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: {
            uid: true,
            message: true,
            senderType: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getTicketByUidForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { uid },
      include: { messages: true },
    });

    res.status(200).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = UpdateSupportTicketSchema.safeParse(req.body);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);

  if (!authParsed.success || !bodyParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const reqData = bodyParsed.data;

  try {
    await prisma.supportTicket.update({
      where: { uid },
      data: {
        status: reqData.status,
        priority: reqData.priority,
      },
    });

    res.status(200).json({ success: "Ticket updated successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = DeleteSupportTicketSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;

  try {
    await prisma.supportTicket.delete({
      where: { uid },
    });

    res.status(200).json({ success: "Ticket deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);
  const bodyParsed = CreateTicketMessageSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid: userUid } = authParsed.data;
  const { uid: ticketUid } = paramsParsed.data;
  const { message } = bodyParsed.data;

  try {
    const newMessage = await prisma.ticketMessage.create({
      data: {
        uid: uuidv4(),
        ticketUid,
        senderUid: userUid,
        message,
        senderType: "USER",
      },
    });

    res
      .status(200)
      .json({ success: "Message added successfully.", uid: newMessage.uid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addMessageForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetSupportTicketByUidSchema.safeParse(req.params);
  const bodyParsed = CreateTicketMessageSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid: ticketUid } = paramsParsed.data;
  const { message } = bodyParsed.data;
  const { uid: adminUid } = authParsed.data;

  try {
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketUid,
        senderUid: adminUid,
        message,
        senderType: "ADMIN",
      },
    });

    res.status(200).json({
      success: "Admin message added successfully.",
      uid: newMessage.uid,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = DeleteTicketMessageSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const { uid } = paramsParsed.data;

  try {
    await prisma.ticketMessage.delete({
      where: { uid },
    });

    res.status(200).json({ success: "Message deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
