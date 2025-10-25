import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";

router.get("/", authenticateAdmin, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticateAdmin, users.getUserByUid);
router.get("/affiliate", authenticateUser, users.getAffiliateData);
router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateAdmin, users.deleteUser);
router.delete("/multiple", authenticateAdmin, users.deleteUsers);

export default router;
