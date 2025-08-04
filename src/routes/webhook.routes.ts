import express from "express";
import * as webhooks from "../controllers/webhook.controllers";

const router = express.Router();

router.post("/flutterwave/:storeId", webhooks.flutterwaveWebhook);
router.post("/paystack/:storeId", webhooks.paystackWebhook);

export default router;
