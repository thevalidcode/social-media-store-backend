import express from "express";
import * as auth from "../controllers/auth.controllers";
import { openCors } from "../config/cors.config";

const router = express.Router();

router.get("/google", openCors, auth.redirectToGoogle);
router.get("/callback/google", openCors, auth.googleCallback);
router.post("/session/verify", openCors, auth.verifySessionCode);

export default router;
