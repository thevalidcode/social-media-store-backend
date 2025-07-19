import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers"
;
import { authenticate } from "../middleware/authenticate";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";

router.get("/", authenticate, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticate, users.getUserByUid);
router.patch("/", authenticate, users.updateUser);
router.delete("/", authenticate, users.deleteUser);
router.delete("/multiple", authenticate, users.deleteUsers);

export default router;
