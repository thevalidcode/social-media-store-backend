import express from "express";
import * as apis from "../controllers/api.controllers";
import { apiRequestLimiter } from "../middleware/ratelimit/api.ratelimit";

const router = express.Router();

router.post("/", apiRequestLimiter, apis.apiRequests);

export default router;
