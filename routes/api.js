const express = require("express");
const router = express.Router();
const { apiFunctions } = require("../controllers/api");

/**
 * @swagger
 * /api/v2:
 *   post:
 *     summary: "Handle API actions: services, status, refill_status, balance, cancel, add, refill"
 *     tags:
 *       - API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - action
 *             properties:
 *               key:
 *                 type: string
 *                 description: API authentication key
 *               action:
 *                 type: string
 *                 enum: [services, status, refill_status, balance, cancel, add, refill]
 *                 description: Action to execute
 *               order:
 *                 type: string
 *                 description: Single order ID (required for status, cancel, refill_status)
 *               orders:
 *                 type: string
 *                 description: Comma-separated order IDs (alternative to 'order' for status)
 *               service:
 *                 type: string
 *                 description: Service ID (required for add)
 *               link:
 *                 type: string
 *                 description: URL to be used with add
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity for the add action
 *     responses:
 *       200:
 *         description: Success response with data or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Result status (success, error)
 *                 data:
 *                   type: object
 *                   description: Response data depends on action
 *       400:
 *         description: Bad request due to missing/invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   description: Error details
 *       401:
 *         description: Unauthorized - invalid API key
 *       404:
 *         description: Not found - order, service, or resource not found
 *       500:
 *         description: Internal server error
 */
router.post("/api/v2", apiFunctions);

module.exports = router;
