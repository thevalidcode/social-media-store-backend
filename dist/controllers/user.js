"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.deleteUsers = exports.deleteUser = exports.getUserByUid = exports.me = exports.createUser = exports.getUsers = void 0;
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const crud_1 = require("../crud");
const emails_1 = require("../utils/emails");
const createUserSchema = zod_1.z.object({
    panel_id: zod_1.z.coerce.number(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string(),
    password: zod_1.z.string().min(6),
    ref: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
const meQuerySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    panel_id: zod_1.z.coerce.number(),
});
const deleteUserSchema = zod_1.z.object({ uid: zod_1.z.string() });
const deleteUsersSchema = zod_1.z.object({ uids: zod_1.z.array(zod_1.z.string()) });
const updateUserSchema = zod_1.z.object({
    data: zod_1.z.object({
        uid: zod_1.z.string(),
        username: zod_1.z.string().optional(),
        full_name: zod_1.z.string().optional(),
        balance: zod_1.z.number().optional(),
    }),
});
const getUsers = async (req, res) => {
    const { panel_id, role } = req.auth;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const allUsers = await (0, crud_1.getDocs)("users", panel_id, {
            removeKeys: ["password"],
        });
        res.status(200).json(allUsers);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res) => {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { panel_id, email, username, ref, password } = parsed.data;
    try {
        const allUsers = await (0, crud_1.getDocs)("users", panel_id);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const emailExists = allUsers.some((user) => user.email === email);
        const usernameExists = allUsers.some((user) => user.username === username);
        if (emailExists) {
            res.status(400).send({ error: "Email already exists" });
            return;
        }
        if (usernameExists) {
            res.status(400).send({ error: "Username already exists" });
            return;
        }
        const userData = { ...parsed.data, password: hashedPassword };
        if (ref) {
            await (0, crud_1.addPanelDoc)("referrals", { username, user_id: parseInt(ref) }, panel_id);
        }
        const newUser = await (0, crud_1.addPanelDoc)("users", userData, panel_id);
        const token = jsonwebtoken_1.default.sign({ email, panel_id, key: newUser.api_key }, process.env.JWT_SECRET, { expiresIn: "7d" });
        await (0, emails_1.sendEmail)(undefined, "new_user", userData, panel_id);
        res.status(200).send({
            success: "Created Successfully",
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            },
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
};
exports.createUser = createUser;
const me = async (req, res) => {
    const parsed = meQuerySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { email, password, panel_id } = parsed.data;
    try {
        const user = await (0, crud_1.getDocs)("users", panel_id, {
            find: { field: "email", operator: "===", value: email },
            removeKeys: ["password"],
        });
        const admin = await (0, crud_1.getDocs)("admins", panel_id, {
            find: { field: "email", operator: "===", value: email },
            removeKeys: ["password"],
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
        const isMatch = await bcrypt_1.default.compare(password, account.password);
        if (!isMatch) {
            res.status(400).json({ error: "Incorrect login details" });
            return;
        }
        const key = account.key || (0, uuid_1.v4)();
        const token = jsonwebtoken_1.default.sign({ email, panel_id, key }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res.status(200).json({
            success: "Logged in successfully",
            token,
            role: admin ? admin.role || "admin" : "user",
            user: {
                id: account.id,
                email: account.email,
                username: account.username,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};
exports.me = me;
const getUserByUid = async (req, res) => {
    const { uid } = req.params;
    const { panel_id, role } = req.auth;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        const user = await (0, crud_1.getDocs)("users", panel_id, {
            find: { uid },
            removeKeys: ["password"],
        });
        res.status(200).send({ user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
exports.getUserByUid = getUserByUid;
const deleteUser = async (req, res) => {
    const { panel_id, role } = req.auth;
    const parsed = deleteUserSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { uid } = parsed.data;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDoc)("users", uid, panel_id);
        res.status(200).send({ success: "Deleted Successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
const deleteUsers = async (req, res) => {
    const { panel_id, role } = req.auth;
    const parsed = deleteUsersSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { uids } = parsed.data;
    if (role !== "admin") {
        res.status(403).json({ error: "Access denied. Admins only." });
        return;
    }
    try {
        await (0, crud_1.deletePanelDocs)("users", uids, panel_id);
        res.status(200).send({ success: "Deleted Successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};
exports.deleteUsers = deleteUsers;
const updateUser = async (req, res) => {
    const { panel_id, role } = req.auth;
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() });
        return;
    }
    const { data } = parsed.data;
    const allowedFields = ["username", "full_name"];
    if (role === "admin")
        allowedFields.push("balance");
    const safeUpdate = {};
    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(data, field)) {
            safeUpdate[field] = data[field];
        }
    }
    if (Object.keys(safeUpdate).length === 0) {
        res.status(400).json({ error: "No valid fields to update" });
        return;
    }
    try {
        await (0, crud_1.updatePanelDoc)("users", data.uid, safeUpdate, panel_id);
        res.status(200).json({ code: "update-success" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
};
exports.updateUser = updateUser;
