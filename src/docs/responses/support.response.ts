import { z } from "zod";
import {
  SupportTicketAdminSchema,
  SupportTicketUserSchema,
  SupportMessageSchema,
} from "../../schemas/support.schema";

export const SupportTicketsForAdminsListResponse = {
  description: "List of all support tickets for admins",
  content: {
    "application/json": {
      schema: z.array(SupportTicketAdminSchema),
    },
  },
};

export const SupportTicketsForUsersListResponse = {
  description: "List of all support tickets for users",
  content: {
    "application/json": {
      schema: z.array(SupportTicketUserSchema),
    },
  },
};

export const SupportTicketAdminObject = {
  description: "Single support ticket object for admin",
  content: {
    "application/json": {
      schema: SupportTicketAdminSchema,
    },
  },
};

export const SupportTicketUserObject = {
  description: "Single support ticket object for user",
  content: {
    "application/json": {
      schema: SupportTicketUserSchema,
    },
  },
};

export const SupportMessagesListResponse = {
  description: "List of all messages for a specific ticket",
  content: {
    "application/json": {
      schema: z.array(SupportMessageSchema),
    },
  },
};

export const SupportMessageObject = {
  description: "Single message object",
  content: {
    "application/json": {
      schema: SupportMessageSchema,
    },
  },
};

export const SupportTicketCreatedResponse = {
  description: "Successfully created a support ticket",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Support ticket created successfully."),
        uid: z.string(),
      }),
    },
  },
};

export const SupportTicketUpdatedResponse = {
  description: "Successfully updated a support ticket",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Support ticket updated successfully."),
        uid: z.string(),
      }),
    },
  },
};

export const SupportTicketDeletedResponse = {
  description: "Successfully deleted a support ticket",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Support ticket deleted successfully."),
      }),
    },
  },
};

export const SupportMessageCreatedResponse = {
  description: "Successfully added a message to a support ticket",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Message added successfully."),
        uid: z.string(),
      }),
    },
  },
};

export const SupportMessageDeletedResponse = {
  description: "Successfully deleted a message",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Message deleted successfully."),
      }),
    },
  },
};
