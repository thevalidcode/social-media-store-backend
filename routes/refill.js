const express = require("express");
const router = express.Router();
const refill = require("../controllers/refill");

/**
 * @swagger
 * tags:
 *   name: Refill
 *   description: Refill-related operations for SMM services
 */

/**
 * @swagger
 * /refill/send:
 *   post:
 *     summary: Send an order for refill to the main server
 *     tags: [Refill]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Panel/Stroe ID
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               orderId:
 *                 type: string
 *                 description: ID of the order to refill
 *             required:
 *               - panel_id
 *               - key
 *               - orderId
 *     responses:
 *       200:
 *         description: Sent for refill
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/send", refill.sendRefill);

/**
 * @swagger
 * /refill/get/availability:
 *   post:
 *     summary: Check refill availability for multiple services
 *     tags: [Refill]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Panel/Stroe ID
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               serviceNames:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of service names to check for refill
 *             required:
 *               - panel_id
 *               - key
 *               - serviceNames
 *     responses:
 *       200:
 *         description: Refill availability returned
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/get/availability", refill.getRefillAvailability);

/**
 * @swagger
 * /refill/get-docs:
 *   post:
 *     summary: Get list of refill records
 *     tags: [Refill]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Panel/Stroe ID
 *               key:
 *                 type: string
 *                 description: Admin API key
 *             required:
 *               - panel_id
 *               - key
 *     responses:
 *       200:
 *         description: Refill documents fetched successfully
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/get-docs", refill.getRefillDocs);

module.exports = router;
