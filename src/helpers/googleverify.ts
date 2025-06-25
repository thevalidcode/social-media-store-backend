import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID || "");

export const verifyGoogleIdToken = async (
  idToken: string
): Promise<{
  email: string;
  name: string;
  avatar: string;
  googleId: string;
  picture: string;
}> => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) {
    throw new Error("Invalid Google ID token");
  }

  return {
    email: payload.email,
    name: payload.name || "",
    avatar: payload.picture || "",
    googleId: payload.sub,
    picture: payload.picture || "",
  };
};
