import express from "express";
import * as admins from "../controllers/admin.controllers";
import rateLimit from "express-rate-limit";
import { openCors } from "../config/cors.config";
const router = express.Router();

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
});

// Swagger Routes
router.get("/login", openCors, admins.adminSwaggerLogin);
router.post("/login", openCors, strictLimiter, admins.authenticateSwaggerAdmin);
router.post("/logout", openCors, admins.logoutSwaggerAdmin);

// Store Routes
router.post("/me", openCors, admins.authenticateAdmin);

export default router;
