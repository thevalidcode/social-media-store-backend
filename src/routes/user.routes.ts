import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";

router.get("/", authenticateAdmin, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", strictLimiter, users.verifySession);
router.post("/reset-password", strictLimiter, users.resetPassword);
router.post("/forgot-password", strictLimiter, users.forgotPassword);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticateUser, users.getUserByUid);

router.get("/affiliate", authenticateUser, users.getAffiliateData);
router.patch("/", authenticateUser, users.updateUser);
router.patch("/admin", authenticateAdmin, users.updateUserByAdmin);
router.delete("/", authenticateAdmin, users.deleteUser);
router.delete("/multiple", authenticateAdmin, users.deleteUsers);

export default router;
