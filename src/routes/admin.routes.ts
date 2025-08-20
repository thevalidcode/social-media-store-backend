import express from "express";
import * as admins from "../controllers/admin.controllers";
const router = express.Router();

router.post("/me", admins.authenticateAdmin);

export default router;
