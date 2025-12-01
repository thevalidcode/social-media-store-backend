import express from "express";
const router = express.Router();
import * as rates from "../controllers/rate.controllers";

// Public routes
router.get("/", rates.getCurrentRates);

export default router;
