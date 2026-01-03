import express from "express";
import * as apis from "../controllers/api.controllers";
import { apiRequestLimiter } from "../middleware/ratelimit/api.ratelimit";
import { openCors } from "../config/cors.config";

const router = express.Router();

router.post("/", openCors, apiRequestLimiter, apis.apiRequests);

export default router;
