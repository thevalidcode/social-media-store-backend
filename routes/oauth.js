import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../helpers/googleverify.js";
import { getDocs, addPanelDoc } from "../crud.js";

const router = express.Router();

async function isValidStoreDomain(url) {
  const match = url.match(/^https?:\/\/([^/]+)/i);
  if (!match) return false;
  const domain = match[1];
  const panel = await getDocs("registered_panels", null, {
    find: { uid: domain },
  });
  return !!panel;
}

router.get("/login/google", (req, res) => {
  const { redirect, panel_id } = req.query;

  if (!redirect || !panel_id) {
    return res.status(400).send("Missing redirect or panel_id");
  }

  const state = encodeURIComponent(JSON.stringify({ redirect, panel_id }));

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/panel/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
});

router.get("/callback/google", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  let redirectDomain, panel_id;
  try {
    const parsed = JSON.parse(decodeURIComponent(state));
    redirectDomain = parsed.redirect;
    panel_id = parseInt(parsed.panel_id);
  } catch {
    return res.status(400).send("Invalid state");
  }

  // ⚠️ SECURITY: Optional – validate allowed redirect domains
  const allowed = await isValidStoreDomain(redirectDomain);
  if (!allowed) return res.status(400).send("Unauthorized domain");

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:
        "https://auth.validpanel.com/api/auth/panel/callback/google",
      grant_type: "authorization_code",
    });

    const { id_token, access_token } = tokenRes.data;

    // Verify ID token and extract user info
    const googleUser = await verifyGoogleIdToken(id_token); // e.g., { email, name, picture }

    // Fetch users for the given panel_id
    const users = await getDocs("users", panel_id);
    let user = users.find((u) => u.email === googleUser.email);

    // Create new user if not found
    if (!user) {
      user = {
        email: googleUser.email,
        username: googleUser.name.replace(/\s/g, "").toLowerCase(),
        image: googleUser.picture,
        password: await bcrypt.hash(Date.now().toString(), 10), // dummy pass
        api_key: uuidv4(),
      };
      await addPanelDoc("users", user, panel_id);
    }

    // Issue your own session token
    const token = jwt.sign(
      { email: user.email, panel_id, key: user.api_key },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Final redirect with token and user info
    const redirectTo = `${redirectDomain}?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    res.redirect(redirectTo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("OAuth failed");
  }
});

export default router;
