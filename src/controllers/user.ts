import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import {
  addStoreDoc,
  getDocs,
  updateStoreDoc,
  deleteStoreDoc,
  deleteStoreDocs,
} from "../crud";
import { sendEmail } from "../emails";
import { env } from "../config/env";
import { AuthSchema } from "../schemas/user.schema";

const createUserSchema = z.object({
  store_id: z.coerce.number(),
  email: z.string().email(),
  username: z.string(),
  password: z.string().min(6),
  ref: z.union([z.string(), z.number()]).optional(),
});

const meQuerySchema = z.object({
  email: z.string().email(),
  password: z.string(),
  store_id: z.coerce.number(),
});

const deleteUserSchema = z.object({ uid: z.string() });
const deleteUsersSchema = z.object({ uids: z.array(z.string()) });
const updateUserSchema = z.object({
  data: z.object({
    uid: z.string(),
    username: z.string().optional(),
    full_name: z.string().optional(),
    balance: z.number().optional(),
  }),
});

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { store_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const allUsers = await getDocs("users", store_id, {
      removeKeys: ["password"],
    });
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { store_id, email, username, ref, password } = parsed.data;

  try {
    const allUsers = await getDocs("users", store_id);
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailExists = allUsers.some((user: any) => user.email === email);
    const usernameExists = allUsers.some(
      (user: any) => user.username === username
    );

    if (emailExists) {
      res.status(400).send({ error: "Email already exists" });
      return;
    }
    if (usernameExists) {
      res.status(400).send({ error: "Username already exists" });
      return;
    }

    const userData = {
      ...parsed.data,
      api_key: uuidv4(),
      password: hashedPassword,
    };

    if (ref) {
      await addStoreDoc(
        "referrals",
        { username, user_id: parseInt(ref as string) },
        store_id
      );
    }

    const newUser = await addStoreDoc("users", userData, store_id);

    const token = jwt.sign(
      {
        email,
        store_id,
        api_key: newUser.api_key,
        role: "user",
      },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await sendEmail(undefined, "new_user", userData, store_id);

    res.status(200).send({
      success: "Created Successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const parsed = meQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password, store_id } = parsed.data;

  try {
    const user = await getDocs("users", store_id, {
      find: { field: "email", operator: "===", value: email },
    });

    const admin = await getDocs("admins", store_id, {
      find: { field: "email", operator: "===", value: email },
    });

    const account = user || admin;
    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if (user && user.status === "banned") {
      res
        .status(403)
        .json({ error: "You’ve been banned from this site. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const api_key = account.api_key || uuidv4();

    const role = account.role;

    const token = jwt.sign({ email, store_id, api_key, role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    delete account.password;

    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: {
        id: account.id,
        email: account.email,
        username: account.username,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const getUserByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { store_id, role } = parsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Unauthorised User." });
    return;
  }

  try {
    const user = await getDocs("users", store_id, {
      find: { uid },
      removeKeys: ["password"],
    });
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const { uid } = req.body;
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }
  const parsed = deleteUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    await deleteStoreDoc("users", uid, store_id);
    res.status(200).send({ success: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = deleteUsersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uids } = parsed.data;

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  try {
    await deleteStoreDocs("users", uids, store_id);
    res.status(200).send({ success: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { store_id, role } = authParsed.data;

  if (role === "user") {
    res.status(403).json({ error: "Access denied, Admins only." });
    return;
  }

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { data } = parsed.data;

  const allowedFields = ["username", "full_name"];
  if (role === "admin") allowedFields.push("balance");

  const safeUpdate: any = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      safeUpdate[field] = data[field as keyof typeof data];
    }
  }

  if (Object.keys(safeUpdate).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  try {
    await updateStoreDoc("users", data.uid, safeUpdate, store_id);
    res.status(200).json({ code: "update-success" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};
