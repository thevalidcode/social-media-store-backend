import express from "express";
import * as webhooks from "../controllers/webhook.controllers";

const router = express.Router();

router.post("/flutterwave", webhooks.flutterwaveWebhook);
router.post("/paystack", webhooks.paystackWebhook);

export default router;
