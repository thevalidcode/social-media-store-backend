const express = require("express");
const router = express.Router();
const site = require("../controllers/site");

/**
 * @swagger
 * /metadata/get:
 *   post:
 *     summary: Fetch Open Graph metadata from a given URL
 *     tags: [Site]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: Domain or full path (without protocol) to fetch metadata from
 *                 example: www.example.com
 *     responses:
 *       200:
 *         description: Successfully retrieved Open Graph metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ogTitle:
 *                   type: string
 *                 ogDescription:
 *                   type: string
 *                 ogImage:
 *                   type: object
 *                 ogUrl:
 *                   type: string
 *       500:
 *         description: Failed to fetch metadata
 */
router.post("/metadata/get", site.getMetaData);

module.exports = router;
