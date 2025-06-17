const express = require("express");
const router = express.Router();
const panels = require("../controllers/panels");

/**
 * @swagger
 * /panel/get/panel_id:
 *   post:
 *     summary: Get panel_id by domain
 *     tags: [Panels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns the panel_id associated with the domain
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 panel_id:
 *                   type: number
 *                   description: The ID of the panel associated with the domain
 *       500:
 *         description: Server error
 */
router.post("/get/panel_id", panels.getPanelId);

/**
 * @swagger
 * /panel/get/styles:
 *   post:
 *     summary: Get design styles for a panel
 *     tags: [Panels]
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
 *     responses:
 *       200:
 *         description: Returns design styles object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error
 */
router.post("/get/styles", panels.getStyles);

/**
 * @swagger
 * /panel/get/site/data:
 *   post:
 *     summary: Get site general data for a panel
 *     tags: [Panels]
 *     parameters:
 *       - in: body
 *         name: panel_id
 *         schema:
 *           type: number
 *         required: true
 *         description: Panel ID to fetch site general data
 *     responses:
 *       200:
 *         description: Returns site general data object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error
 */
router.post("/get/site/data", panels.getSiteData);

/**
 * @swagger
 * /panel/get/rates:
 *   post:
 *     summary: Get latest exchange rates
 *     tags: [Panels]
 *     parameters:
 *       - in: body
 *         name: panel_id
 *         schema:
 *           type: number
 *         required: true
 *         description: Panel ID to fetch site rates
 *     responses:
 *       200:
 *         description: Returns latest exchange rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error
 */
router.post("/get/rates", panels.getRates);

/**
 * @swagger
 * /panel/get/current-user:
 *   post:
 *     summary: Get current user data by UID and panel_id
 *     tags: [Panels]
 *     parameters:
 *       - in: body
 *         name: panel_id
 *         schema:
 *           type: number
 *         required: true
 *         description: Panel ID
 *       - in: query
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User UID
 *     responses:
 *       200:
 *         description: Returns user data without password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error
 */
router.post("/get/current-user", panels.getCurrentUser);

/**
 * @swagger
 * /panel/get/current-admin:
 *   post:
 *     summary: Get current admin data by UID and panel_id
 *     tags: [Panels]
 *     parameters:
 *       - in: body
 *         name: panel_id
 *         schema:
 *           type: number
 *         required: true
 *         description: Panel ID
 *       - in: query
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: Admin UID
 *     responses:
 *       200:
 *         description: Returns admin data without password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Server error
 */
router.post("/get/current-admin", panels.getCurrentAdmin);

module.exports = router;
