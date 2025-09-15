import express from "express";
const router = express.Router();
import * as rates from "../controllers/rate.controllers";
import { limittActions } from "../middleware/ratelimit/common.ratelimit";

// Public routes
router.get("/", limittActions, rates.getCurrentRates);

export default router;
