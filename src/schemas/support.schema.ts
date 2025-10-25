import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  TicketPriority,
  TicketStatus,
  MessageSenderType,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const SupportMessageSchema = z
  .object({
    uid: z.string().uuid(),
    ticketUid: z.string().uuid(),
    senderUid: z.string().uuid(),
    message: z.string().min(1, "Message content cannot be empty"),
    senderType: z.nativeEnum(MessageSenderType),
    createdAt: z.coerce.date(),
  })
  .openapi("TicketMessage");

export const SupportTicketAdminSchema = z
  .object({
    uid: z.string(),
    storeId: z.number(),
    userUid: z.string(),
    storeScopedId: z.number(),
    subject: z.string(),
    status: z.nativeEnum(TicketStatus),
    priority: z.nativeEnum(TicketPriority),
    createdAt: z.coerce.date(),
    messages: SupportMessageSchema.optional(),
    updatedAt: z.coerce.date(),
  })
  .openapi("SupportTicket");

export const SupportTicketUserSchema = z.object({
  uid: z.string(),
  subject: z.string(),
  status: z.nativeEnum(TicketStatus),
  priority: z.nativeEnum(TicketPriority),
  createdAt: z.coerce.date(),
});

export const CreateSupportTicketSchema = z.object({
  storeId: z.number(),
  userUid: z.string(),
  subject: z.string(),
  message: z.string(),
  description: z.string().optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
});

export const UpdateSupportTicketSchema = z.object({
  uid: z.string(),
  subject: z.string().optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
});

export const DeleteSupportTicketSchema = z.object({
  uid: z.string(),
});

export const GetSupportTicketByUidSchema = z.object({
  uid: z.string(),
});

export const CreateTicketMessageSchema = z.object({
  senderUid: z.number(),
  message: z.string(),
});

export const DeleteTicketMessageSchema = z.object({
  uid: z.string(),
});
