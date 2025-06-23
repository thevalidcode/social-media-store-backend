import express from "express";
const router = express.Router();
import * as users from "../controllers/user";
import { authenticate } from "../middleware/authenticate";

router.get("/", authenticate, users.getUsers);
router.get("/me", users.me);
router.post("/", users.createUser);
router.get("/:uid", users.getUserByUid);
router.put("/", authenticate, users.updateUser);
router.delete("/", authenticate, users.deleteUser);
router.delete("/multiple", authenticate, users.deleteUsers);

export default router;
