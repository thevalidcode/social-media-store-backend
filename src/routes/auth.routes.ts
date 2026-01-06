import express from "express";
import * as auth from "../controllers/auth.controllers";
import { openCors } from "../config/cors.config";
import { authRateLimit } from "../middleware/auth.ratelimit";

const router = express.Router();

router.get("/google", openCors, authRateLimit, auth.redirectToGoogle);
router.get("/callback/google", openCors, authRateLimit, auth.googleCallback);
router.post("/session/verify", openCors, authRateLimit, auth.verifySessionCode);

export default router;
