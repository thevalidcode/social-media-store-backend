import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers"
    ;
import { authenticate } from "../middleware/authenticate";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";
import { isAdmin } from "../middleware/authorize";

router.get("/", authenticate, isAdmin, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticate, users.getUserByUid);
router.patch("/", authenticate, users.updateUser);
router.delete("/", authenticate, isAdmin, users.deleteUser);
router.delete("/multiple", authenticate, isAdmin, users.deleteUsers);

export default router;
