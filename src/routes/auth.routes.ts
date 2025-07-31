import express from "express";
import cors from "cors";
import * as auth from "../controllers/auth.controllers";

const router = express.Router();

// Allow all origins per route
const openCors = cors({ origin: true, credentials: true });

router.get("/google", openCors, auth.redirectToGoogle);
router.get("/callback/google", openCors, auth.googleCallback);
router.post("/session/verify", openCors, auth.verifySessionCode);

export default router;