import { registry } from "../components/registry";
import {
  GoogleAuthResponse,
  InvalidGoogleAuthResponse,
} from "../responses/auth.response";
import { RedirectToGoogleQuerySchema } from "../../schemas/auth.schema";

registry.registerPath({
  method: "get",
  path: "/google",
  summary: "Initiate Google OAuth Login",
  description:
    "Redirects the user to Google OAuth for authentication.\n\n" +
    "After a successful login, Google will redirect back to your backend with a temporary session code.\n\n" +
    "### 🔐 Flow Overview:\n" +
    "- Redirects user to Google login\n" +
    "- After successful auth, redirects to `redirect` with a short-lived `session_code`\n" +
    "- Frontend must exchange the session code for an access token by calling `/session/verify`\n\n" +
    "### 📥 Required Query Parameters:\n" +
    "- `redirect`: Full frontend URL to redirect to after Google login (must be a valid store domain)\n" +
    "- `storeId`: Numeric store ID initiating the login\n\n" +
    "### 🔁 Redirect Response:\n" +
    "- `session_code`: Temporary one-time-use code, valid for 5 minutes\n\n" +
    "Example redirect:\n" +
    "```http\n" +
    "https://your-frontend.com/login/callback?session_code=abc123\n" +
    "```",
  tags: ["Auth"],
  request: {
    query: RedirectToGoogleQuerySchema,
  },
  responses: {
    302: GoogleAuthResponse,
    400: InvalidGoogleAuthResponse,
  },
});
