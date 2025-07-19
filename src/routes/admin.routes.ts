import express from "express";
import cors from "cors";
import * as admins from "../controllers/admin.controllers"
;
import rateLimit from "express-rate-limit";
const router = express.Router();

// Allow all origins per route
const openCors = cors({ origin: true, credentials: true });
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
});

router.get("/login", openCors, admins.adminLogin);
router.post("/login", openCors, strictLimiter, admins.authenticateAdmin);
router.post("/logout", openCors, admins.logoutAdmin);

export default router;
