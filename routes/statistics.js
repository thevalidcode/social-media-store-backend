const express = require("express");
const router = express.Router();
const statistics = require("../controllers/statistics");

/**
 * @swagger
 * /statistics/get:
 *   post:
 *     summary: Retrieve admin panel statistics
 *     tags: [Statistics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: The ID of the panel to fetch statistics for
 *                 example: 12345
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *                 example: "abcde12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   description: List of transactions with user info
 *                   items:
 *                     type: object
 *                 orders:
 *                   type: array
 *                   description: All orders
 *                   items:
 *                     type: object
 *                 users:
 *                   type: array
 *                   description: All users
 *                   items:
 *                     type: object
 *                 completedOrders:
 *                   type: array
 *                   description: Completed orders
 *                   items:
 *                     type: object
 *                 cancelledOrders:
 *                   type: array
 *                   description: Cancelled orders
 *                   items:
 *                     type: object
 *                 revenueGrowth:
 *                   type: array
 *                   description: Revenue growth data by month
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Jan
 *                       revenue:
 *                         type: number
 *                         example: 4521.75
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.post("/get", statistics.getStatistics);

module.exports = router;
