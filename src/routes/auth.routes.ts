import express from "express";
import * as auth from "../controllers/auth.controllers";
import { authRateLimit } from "../middleware/ratelimit/auth.ratelimit";

const router = express.Router();

router.get("/google", authRateLimit, auth.redirectToGoogle);
router.get("/callback/google", authRateLimit, auth.googleCallback);

export default router;
