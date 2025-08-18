import express from "express";
import * as apis from "../controllers/api.controllers";
import { limittActions } from "../middleware/ratelimit/common.ratelimit";
import { openCors } from "../config/cors.config";

const router = express.Router();

router.post("/", openCors, limittActions, apis.apiRequests);

export default router;
