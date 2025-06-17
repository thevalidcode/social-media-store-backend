const express = require("express");
const router = express.Router();
const rateController = require("../controllers/rates");

/**
 * @swagger
 * tags:
 *   name: Exchange Rates
 *   description: API endpoints for managing exchange rates
 */

/**
 * @swagger
 * /rates/get:
 *   post:
 *     summary: Retrieve the latest exchange rates
 *     tags: [Exchange Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               panel_id:
 *                 type: number
 *                 description: Panel/Store identifier
 *             required:
 *               - key
 *               - panel_id
 *     responses:
 *       200:
 *         description: Latest exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: Missing key or failed to retrieve rates
 *       401:
 *         description: Invalid API key
 */
router.post("/get", rateController.getRates);

/**
 * @swagger
 * /rates/update:
 *   post:
 *     summary: Update exchange rates in the database
 *     tags: [Exchange Rates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               panel_id:
 *                 type: number
 *                 description: Panel/Store identifier
 *             required:
 *               - key
 *               - panel_id
 *     responses:
 *       200:
 *         description: Exchange rates updated successfully
 *       400:
 *         description: Missing key or update failed
 *       401:
 *         description: Invalid API key
 */
router.post("/update", rateController.updateRatesToDatabase);

module.exports = router;
