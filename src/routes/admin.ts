import express from "express";
import cors from "cors";
import * as admins from "../controllers/admin";

const router = express.Router();

// Allow all origins per route
const openCors = cors({ origin: true, credentials: true });

router.get("/login", openCors, admins.adminLogin);
router.post("/login", openCors, admins.authenticateAdmin);
router.post("/logout", openCors, admins.logoutAdmin);

export default router;
