import { z } from "zod";

export const SuccessResponse = {
  description: "Operation successful",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Operation completed successfully."),
      }),
    },
  },
};

export const SuccessWithData = {
  description: "Operation successful with data returned",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string().describe("Success message"),
        data: z.any().describe("Payload returned from operation"),
      }),
    },
  },
};

export const BadRequest = {
  description: "Bad request due to invalid input",
  content: {
    "application/json": {
      schema: z.object({
        error: z.object({
          body: z
            .object({
              _errors: z.array(z.string()).optional(),
            })
            .optional(),
          field: z.array(z.string()).optional(),
        }),
      }),
    },
  },
};

export const Forbidden = {
  description: "Unauthorized access due to role or permission",
  content: {
    "application/json": {
      schema: z.object({
        error: z.string().describe("Error message for forbidden access"),
      }),
    },
  },
};

export const ServerError = {
  description: "Internal server error",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("Something went wrong. Please try again later."),
      }),
    },
  },
};

export const InvalidData = {
  description: "Request is missing or has invalid fields",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("No valid fields to update"),
      }),
    },
  },
};
