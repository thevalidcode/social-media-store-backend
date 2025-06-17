const express = require("express");
const router = express.Router();
const payment = require("../controllers/payment");

/**
 * @swagger
 * tags:
 *   name: payment_gateways
 *   description: Payment gateway management and payment processing
 */

/**
 * @swagger
 * /payment/gateways/get:
 *   post:
 *     summary: Get payment gateways (users)
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *             properties:
 *               panel_id:
 *                 type: number
 *                 example: 454
 *                 description: Panel ID to filter gateways
 *               uid:
 *                 type: string
 *                 description: Optional user ID to filter gateways
 *     responses:
 *       200:
 *         description: List of payment gateways
 */
router.post("/gateways/get", payment.getGateways);

/**
 * @swagger
 * /payment/gateways/get/all:
 *   post:
 *     summary: Get all payment gateways (store owners)
 *     tags: [payment_gateways]
 *     responses:
 *       200:
 *         description: List of all payment gateways
 */
router.post("/gateways/get/all", payment.getAllGateways);

/**
 * @swagger
 * /payment/gateways/get/id:
 *   post:
 *     summary: Get a payment gateway by ID
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: Payment gateway ID
 *     responses:
 *       200:
 *         description: Payment gateway details
 */
router.post("/gateways/get/id", payment.getAllGatewayById);

/**
 * @swagger
 * /payment/gateways/update:
 *   post:
 *     summary: Update a payment gateway
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment gateway updated
 */
router.post("/gateways/update", payment.updateGateway);

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Create a new payment (users only)
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *               - name
 *               - type
 *               - config
 *             properties:
 *               panel_id:
 *                 type: number
 *                 example: 454
 *                 description: The panel ID this gateway belongs to
 *               platform:
 *                 type: string
 *                 description: Gateway name (e.g. "paystack, flutterwave")
 *     responses:
 *       200:
 *         description: Successfully created payment
 *
 *
 * @swagger
 * /payment/gateways/delete:
 *   post:
 *     summary: Delete a payment gateway by UID
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               uid:
 *                 type: string
 *                 description: UID of the payment gateway to delete
 *                 example: "ibur123"
 *     responses:
 *       200:
 *         description: Payment gateway deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment gateway deleted successfully"
 *       404:
 *         description: Payment gateway not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Payment gateway not found"
 */

/**
 * @swagger
 * /payment/gateways/create:
 *   post:
 *     summary: Add a new payment gateway (admin only)
 *     tags: [payment_gateways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminKey
 *               - platform
 *               - min
 *               - max
 *               - status
 *               - name
 *               - payment_description
 *               - description
 *               - image
 *               - secret_key
 *               - panel_id
 *             properties:
 *               adminKey:
 *                 type: string
 *                 description: API key of the admin
 *               platform:
 *                 type: string
 *                 example: "Flutterwave"
 *                 description: Payment gateway platform
 *               min:
 *                 type: number
 *                 example: 100
 *                 description: Minimum payment amount
 *               max:
 *                 type: number
 *                 example: 100000
 *                 description: Maximum payment amount
 *               status:
 *                 type: string
 *                 enum: ["active", "inactive"]
 *                 example: "active"
 *               name:
 *                 type: string
 *                 example: "Pay with Flutterwave"
 *               payment_description:
 *                 type: string
 *                 example: "Pay using Flutterwave gateway"
 *               description:
 *                 type: string
 *                 example: "Fast and secure payment"
 *               image:
 *                 type: string
 *                 example: "https://cdn.com/flutterwave.png"
 *               secret_key:
 *                 type: string
 *                 description: Secret API key of the gateway
 *               panel_id:
 *                 type: number
 *                 example: 101
 *     responses:
 *       200:
 *         description: Payment gateway added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: "Added Successfully"
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing some params"
 *       401:
 *         description: Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid API key"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */

/**
 * @swagger
 * /payment/{panel_id}/paystack/webhook:
 *   post:
 *     summary: Paystack payment webhook (admin only)
 *     description: This endpoint is called by Paystack after a payment event. It verifies and processes the transaction. **Should only be accessible internally by Paystack.**
 *     tags: [payment_gateways]
 *     parameters:
 *       - in: path
 *         name: panel_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the panel receiving the payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by Paystack after a transaction
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *       400:
 *         description: Invalid webhook data
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /payment/{panel_id}/flutterwave/webhook:
 *   post:
 *     summary: Flutterwave payment webhook (admin only)
 *     description: This endpoint is called by Flutterwave to report payment events. It validates the payment and updates the order or user balance. **Should be called only by Flutterwave servers.**
 *     tags: [payment_gateways]
 *     parameters:
 *       - in: path
 *         name: panel_id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID of the panel associated with the payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload sent by Flutterwave for transaction verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid or incomplete data
 *       500:
 *         description: Server error during processing
 */

router.post("/gateways/create", payment.addGateway);
router.post("/gateways/delete", payment.deleteGateway);
router.post("/create", payment.createPayment);
router.post("/:panel_id/paystack/webhook", payment.paystackPaymentWebhook);
router.post(
  "/:panel_id/flutterwave/webhook",
  payment.flutterwavePaymentWebhook
);

module.exports = router;
