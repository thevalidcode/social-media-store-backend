import express from "express";
const router = express.Router();
import * as admins from "../controllers/admin";

router.get("/login", admins.adminLogin);
router.post("/login", admins.authenticateAdmin);
router.post("/logout", admins.logoutAdmin);

export default router;
