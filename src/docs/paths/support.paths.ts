import { registry } from "../components/registry";
import {
  CreateSupportTicketSchema,
  UpdateSupportTicketSchema,
  CreateTicketMessageSchema,
  DeleteTicketMessageSchema,
} from "../../schemas/support.schema";

import {
  SupportTicketCreatedResponse,
  SupportTicketUpdatedResponse,
  SupportTicketDeletedResponse,
  SupportTicketsForUsersListResponse,
  SupportTicketsForAdminsListResponse,
  SupportTicketAdminObject,
  SupportTicketUserObject,
  SupportMessageCreatedResponse,
  SupportMessageDeletedResponse,
} from "../responses/support.response";

import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /supports/tickets for users
registry.registerPath({
  method: "get",
  path: "/supports/tickets",
  summary: "Get all Support Tickets for users",
  tags: ["Support Tickets"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SupportTicketsForUsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /supports/tickets/admin for admins
registry.registerPath({
  method: "get",
  path: "/supports/tickets/admin",
  summary: "Get all Support Tickets for admins",
  tags: ["Support Tickets"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SupportTicketsForAdminsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /supports/tickets/admin/{uid} for admins
registry.registerPath({
  method: "get",
  path: "/supports/tickets/{uid}/admin",
  summary: "Get Support Ticket by UID for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Support Tickets"],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SupportTicketAdminObject,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /supports/tickets/{uid} for users
registry.registerPath({
  method: "get",
  path: "/supports/tickets/{uid}",
  summary: "Get Support Ticket by UID for users",
  security: [{ CookieAuth: [] }],
  tags: ["Support Tickets"],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SupportTicketUserObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /supports/tickets
registry.registerPath({
  method: "post",
  path: "/supports/tickets",
  summary: "Create a new Support Ticket",
  tags: ["Support Tickets"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSupportTicketSchema,
        },
      },
    },
  },
  responses: {
    200: SupportTicketCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /supports/tickets/{uid}
registry.registerPath({
  method: "patch",
  path: "/supports/tickets/{uid}",
  summary: "Update a Support Ticket",
  tags: ["Support Tickets"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateSupportTicketSchema,
        },
      },
    },
  },
  responses: {
    200: SupportTicketUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /supports/tickets/{uid}
registry.registerPath({
  method: "delete",
  path: "/supports/tickets/{uid}",
  summary: "Delete a Support Ticket",
  tags: ["Support Tickets"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: SupportTicketDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// POST /supports/{uid}/messages for user
registry.registerPath({
  method: "post",
  path: "/supports/{uid}/messages",
  summary: "Create a new Ticket Message for user",
  tags: ["Ticket Messages"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      description: "The Ticket UID",
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTicketMessageSchema,
        },
      },
    },
  },
  responses: {
    200: SupportMessageCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// POST /supports/{uid}/messages/admin for admin
registry.registerPath({
  method: "post",
  path: "/supports/{uid}/messages/admin",
  summary: "Create a new Ticket Message for admin",
  tags: ["Ticket Messages"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      description: "The Ticket UID",
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateTicketMessageSchema,
        },
      },
    },
  },
  responses: {
    200: SupportMessageCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /supports/messages/{uid}
registry.registerPath({
  method: "delete",
  path: "/supports/messages/{uid}",
  summary: "Delete a Ticket Message",
  tags: ["Ticket Messages"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      description: "The Message UID",
      schema: { type: "string" },
    },
  ],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DeleteTicketMessageSchema,
        },
      },
    },
  },
  responses: {
    200: SupportMessageDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
