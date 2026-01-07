import { z } from "zod";
import { UserSchema } from "../../schemas/user.schema";

export const GoogleAuthResponse = {
  description:
    "Redirects to frontend with a one-time `session_code` in query parameters.",
};

export const InvalidGoogleAuthResponse = {
  description: "Missing or invalid parameters or domain.",
  content: {
    "application/json": {
      schema: z.object({ error: z.string() }),
    },
  },
};

export const SessionVerifiedResponse = {
  description: "Session verified, cookies set, user authenticated.",
  content: {
    "application/json": {
      schema: z.object({
        user: UserSchema,
        success: z.string(),
      }),
    },
  },
};

export const InvalidSessionResponse = {
  description: "Invalid or expired session code.",
  content: {
    "application/json": {
      schema: z.object({ error: z.string() }),
    },
  },
};

export const UserInvalidSessionResponse = {
  description: "User associated with session code not found.",
  content: {
    "application/json": {
      schema: z.object({ error: z.string() }),
    },
  },
};
