import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import { getDocs, addPanelDoc } from "../crud";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";
import { Request, Response } from "express";

const router = express.Router();

const isValidStoreDomain = async (url: string): Promise<boolean> => {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  if (!match) return false;
  const domain = match[1];
  const panel = await getDocs("panels", null, {
    find: { field: "uid", operator: "===", value: domain },
  });
  return !!panel;
};

router.get("/login/google", async (req: Request, res: Response): Promise<void> => {
  const { redirect, panel_id } = req.query;

  if (!redirect || !panel_id) {
    res.status(400).send("Missing redirect or panel_id");
    return;
  }

  const state = encodeURIComponent(
    JSON.stringify({ redirect, panel_id: Number(panel_id) })
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/panel/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
});

router.get(
  "/callback/google",
  async (req: Request, res: Response): Promise<void> => {
    const { code, state } = req.query;

    if (!code || !state) {
      res.status(400).send("Missing code or state");
      return;
    }

    let redirectDomain: string, panel_id: number;
    try {
      const parsed = JSON.parse(decodeURIComponent(state as string));
      redirectDomain = parsed.redirect;
      panel_id = parseInt(parsed.panel_id);
    } catch {
      res.status(400).send("Invalid state");
      return;
    }

    const allowed = await isValidStoreDomain(redirectDomain);
    if (!allowed) {
      res.status(400).send("Unauthorized domain");
      return;
    }

    try {
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri:
          "https://auth.validpanel.com/api/auth/panel/callback/google",
        grant_type: "authorization_code",
      });

      const { id_token } = tokenRes.data;
      const googleUser = await verifyGoogleIdToken(id_token);

      const users = await getDocs("users", panel_id);
      let user = users.find((u: any) => u.email === googleUser.email);

      if (!user) {
        user = {
          email: googleUser.email,
          username: googleUser.name.replace(/\s/g, "").toLowerCase(),
          image: googleUser.picture,
          password: await bcrypt.hash(Date.now().toString(), 10),
          api_key: uuidv4(),
          timestamp: new Date(),
          uid: uuidv4(),
        };
        await addPanelDoc("users", user, panel_id);
      }

      const token = jwt.sign(
        { email: user.email, panel_id, api_key: user.api_key },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const redirectTo = `${redirectDomain}?token=${token}&email=${encodeURIComponent(
        user.email
      )}`;
      res.redirect(redirectTo);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send("OAuth failed");
    }
  }
);

export default router;
