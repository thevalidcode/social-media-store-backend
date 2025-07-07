import { registry } from "../components/registry";
import { z } from "zod";

registry.registerPath({
  method: "get",
  path: "/google",
  summary: "Redirect user to Google OAuth",
  description:
    "Initiates the Google OAuth flow for a registered social media store.\n\n" +
    "This endpoint handles both **login** and **account creation** using a Google account.\n\n" +
    "### 🔐 What It Does:\n" +
    "- Redirects the user to Google for authentication\n" +
    "- After a successful login, the user is redirected back to the provided `redirect` URL with a token and email\n" +
    "- If the user doesn't exist in the store's database, a new user account is created automatically\n\n" +
    "### 📥 Required Parameters:\n" +
    "- `redirect`: The full frontend URL to redirect to after authentication (must be a registered store domain)\n" +
    "- `store_id`: The numeric ID of the store in your system\n\n" +
    "### 🔁 Response Behavior:\n" +
    "- Redirects to `redirect` URL with query parameters:\n" +
    "  - `token`: JWT containing user info\n" +
    "  - `email`: Authenticated user’s email\n\n" +
    "### ⚠️ Frontend Responsibilities:\n" +
    "The frontend must read the token and store it securely (preferably in an HTTP-only cookie).\n\n" +
    "Example logic:\n" +
    "```js\n" +
    "const params = new URLSearchParams(window.location.search);\n" +
    'const token = params.get("token");\n' +
    'const email = params.get("email");\n\n' +
    "if (token) {\n" +
    "  document.cookie = `auth_token=${token}; path=/; Secure; SameSite=Strict`;\n" +
    '  window.location.href = "/dashboard";\n' +
    "}\n" +
    "```\n\n" +
    "The cookie will then be sent with all authenticated requests automatically.\n\n" +
    "🆕 If the user is signing in for the first time, their account will be created on-the-fly, using data from their Google profile.",
  tags: ["Auth"],
  parameters: [
    {
      name: "redirect",
      in: "query",
      required: true,
      description:
        "The registered frontend URL to redirect back to after login. Must include the protocol (e.g. https://validpanel.com or http://localhost:3000).",
      schema: {
        type: "string",
        format: "uri",
      },
    },
    {
      name: "store_id",
      in: "query",
      required: true,
      description: "The numeric ID of the store initiating the login.",
      schema: {
        type: "integer",
      },
    },
  ],
  responses: {
    302: {
      description:
        "Redirects to the provided `redirect` URL with the access token and email in the query parameters.\n\n" +
        "Example:\n" +
        "`https://your-app.com/dashboard?token=abc123&email=user@example.com`\n\n" +
        "The frontend must extract and store the token (as a cookie or local storage) for future authentication.",
      headers: {
        Location: {
          description:
            "Redirect URL containing the token and email as query parameters.",
          schema: {
            type: "string",
            format: "uri",
          },
        },
      },
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string().email(),
            }),
          }),
        },
      },
    },
    400: {
      description:
        "Bad Request — usually due to missing parameters or an invalid redirect domain.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});
