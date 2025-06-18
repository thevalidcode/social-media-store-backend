import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyGoogleIdToken } from "../helpers/googleverify.js";
import { getDocs, addPanelDoc } from "../crud.js";

const router = express.Router();

router.post("/google", async (req, res) => {
  const { id_token, panel_id } = req.body;
  if (!id_token || !panel_id) {
    return res.status(400).json({ error: "Missing id_token or panel_id" });
  }

  try {
    // 1‑ Verify Google ID token
    const googleUser = await verifyGoogleIdToken(id_token); // throws if invalid

    // 2‑ Get all users for this store
    const users = await getDocs("users", panel_id);
    let user = users.find((u) => u.email === googleUser.email);

    // 3‑ Create user if it doesn’t exist
    if (!user) {
      // Re‑use your duplicate‑check rules (email/username)
      const newUser = {
        email: googleUser.email,
        username: googleUser.name.replace(/\s/g, "").toLowerCase(),
        image: googleUser.avatar,
        password: await bcrypt.hash(Date.now().toString(), 10), // dummy password
        api_key: uuidv4(),
      };
      await addPanelDoc("users", newUser, panel_id);
      user = newUser;
    }

    // 4‑ Issue JWT valid for 7 days
    const accessToken = jwt.sign(
      { email: user.email, panel_id, key: user.api_key },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token: accessToken, user });
  } catch (err) {
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;
