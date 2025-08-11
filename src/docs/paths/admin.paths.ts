import { registry } from "../components/registry";
import { AuthenticateUserSchema } from "../../schemas/user.schema";
import { AuthenticateUserResponse } from "../responses/user.response";
import { BadRequest, ServerError } from "../responses/common.response";

// Authenticate admin
registry.registerPath({
  method: "post",
  path: "/admin/me",
  summary: "Authenticate a admin",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateUserSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});
