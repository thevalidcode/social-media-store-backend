import express from "express";
const router = express.Router();
import * as services from "../controllers/service";
import { authenticate } from "../middleware/authenticate";

router.get("/", services.getServices);
router.post("/import", authenticate, services.importServices);
router.post("/get-service-id", services.getServiceByID);
export default router;
