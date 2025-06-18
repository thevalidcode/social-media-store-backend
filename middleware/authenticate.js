import jwt from "jsonwebtoken";
import { getDocs } from "../crud.js";

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, panel_id, key } = decoded;

    // fetch user and admin (one of them may exist)
    const user = await getDocs("users", panel_id, { find: { email } });
    const admin = await getDocs("admins", panel_id, { find: { email } });

    const keyMatches =
      (user && user.key === key) || (admin && admin.key === key);

    if (!keyMatches) {
      return res.status(401).json({ error: "Key mismatch" });
    }

    // attach identity info to request
    req.auth = {
      email,
      panel_id,
      key,
      role: admin ? admin.role || "admin" : "user",
      user: admin || user,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
