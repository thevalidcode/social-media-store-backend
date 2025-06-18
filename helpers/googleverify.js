import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleIdToken = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload(); // email, name, picture, sub
  return {
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    googleId: payload.sub, // unique Google user ID
  };
};
