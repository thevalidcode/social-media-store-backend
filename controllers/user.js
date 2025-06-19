import {
  addPanelDoc,
  getDocs,
  updatePanelDoc,
  deletePanelDoc,
  deletePanelDocs,
} from "../crud.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emails.js";

export const getUsers = async (req, res) => {
  const { panel_id, role } = req.auth;

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const allUsers = await getDocs("users", panel_id, {
      removeKeys: ["password"],
    });
    return res.status(200).json(allUsers);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  const { panel_id, email, username, ref, password } = req.body;

  if (!panel_id || !email || !username || !password) {
    return res
      .status(400)
      .json({ error: "Missing email, key, panel_id, username or password" });
  }
  try {
    const allUsers = await getDocs("users", panel_id);
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    const emailExists = allUsers.some((user) => user.email === email);
    const usernameExists = allUsers.some((user) => user.username === username);
    if (emailExists) {
      return res.status(400).send({ error: "Email already exists" });
    }
    if (usernameExists) {
      return res.status(400).send({ error: "Username already exists" });
    }
    let newUser;
    if (ref) {
      newUser = await addPanelDoc(
        "referrals",
        { username: username, user_id: parseInt(ref) },
        panel_id
      );
    }
    newUser = await addPanelDoc("users", { ...req.body }, panel_id);

    const token = jwt.sign(
      {
        email,
        panel_id,
        key: newUser.api_key,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await sendEmail(undefined, "new_user", { ...req.body }, panel_id);
    return res.status(204).send({
      success: "Created Successfully",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

export const me = async (req, res) => {
  const { email, password, panel_id } = req.query;

  if (!email || !password || !panel_id) {
    return res.status(400).json({ error: "Missing login details" });
  }

  try {
    const user = await getDocs("users", panel_id, {
      find: { field: "email", operator: "===", value: email },
      removeKeys: ["password"],
    });

    const admin = await getDocs("admins", panel_id, {
      find: { field: "email", operator: "===", value: email },
      removeKeys: ["password"],
    });

    const account = user || admin;

    if (!account) {
      return res.status(400).json({ error: "Incorrect login details" });
    }

    if (user && user.status === "banned") {
      return res.status(403).json({
        error: "You’ve been banned from this site. Contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect login details" });
    }

    // Ensure key exists (or generate if missing)
    const key = account.key || uuidv4();

    // JWT payload
    const token = jwt.sign(
      {
        email,
        panel_id,
        key,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: "Logged in successfully",
      token,
      role: admin ? admin.role || "admin" : "user",
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};

export const getUserByUid = async (req, res) => {
  const { uid } = req.params;
  const { panel_id, role } = req.auth;

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  try {
    const user = await getDocs("users", panel_id, {
      find: { uid },
      removeKeys: ["password"],
    });
    return res.status(200).send({ user });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const deleteUser = async (req, res) => {
  const { panel_id, role } = req.auth;
  const { uid } = req.body;

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  if (!uid) {
    return res.status(400).json({ error: "Missing user uid" });
  }

  try {
    await deletePanelDoc("users", uid, panel_id);
    return res.status(200).send({ success: "Deleted Succesfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (req, res) => {
  const { panel_id, role } = req.auth;
  const { uids = [] } = req.body;

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  if (uids.length === 0) {
    return res.status(400).json({ error: "Missing users uid" });
  }

  try {
    await deletePanelDocs("users", uids, panel_id);
    return res.status(200).send({ success: "Deleted Succesfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

export const updateUser = async (req, res) => {
  const { panel_id, role } = req.auth;
  const { data } = req.body;

  if (!data || typeof data !== "object" || !data.uid) {
    return res.status(400).json({ error: "Invalid or missing data" });
  }

  // 1. build the whitelist
  const allowedFields = ["username", "full_name"];
  if (role === "admin") allowedFields.push("balance");

  // 2. filter incoming data
  const safeUpdate = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      safeUpdate[field] = data[field];
    }
  }

  if (Object.keys(safeUpdate).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    await updatePanelDoc("users", data.uid, safeUpdate, panel_id);
    return res.status(200).json({ code: "update-success" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update user" });
  }
};
