/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Endpoints for page-related data retrieval
 */

const express = require("express");
const router = express.Router();
const pages = require("../controllers/pages");

/**
 * @swagger
 * /pages/home/get:
 *   post:
 *     tags: [Pages]
 *     summary: Get home page data for a panel
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
 *                 description: ID of the panel
 *     responses:
 *       200:
 *         description: Home page data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Home page content object
 *       400:
 *         description: Bad request - missing panel_id
 *       500:
 *         description: Server error
 */
router.post("/home/get", pages.getHomeData);

/**
 * @swagger
 * /pages/dashboard-data:
 *   post:
 *     tags: [Pages]
 *     summary: Get dashboard data including revenue, orders, and recent activity for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *               - key
 *               - uid
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: ID of the panel
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *               uid:
 *                 type: string
 *                 description: User unique ID
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenueGrowthData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Jan
 *                       amount:
 *                         type: number
 *                 ordersTrendsData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: Jan
 *                       orders:
 *                         type: integer
 *                 panelOrders:
 *                   type: integer
 *                   description: Most recent order ID
 *                 userOrders:
 *                   type: integer
 *                   description: Number of user orders
 *                 recentActivity:
 *                   type: array
 *                   description: Recent orders and services
 *                 failedOrders:
 *                   type: integer
 *                   description: Number of failed user orders
 *                 userSpent:
 *                   type: number
 *                   description: Total amount user has spent
 *       401:
 *         description: Unauthorized - invalid API key
 *       500:
 *         description: Server error
 */
router.post("/dashboard-data", pages.getDashboardData);

/**
 * @swagger
 * /pages/affiliate/get:
 *   post:
 *     tags: [Pages]
 *     summary: Get affiliate program settings for a panel
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
 *                 description: ID of the panel
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Affiliate data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 percent:
 *                   type: number
 *                   description: Affiliate commission percentage
 *                 enabled:
 *                   type: boolean
 *                   description: Whether affiliate program is enabled
 *       401:
 *         description: Unauthorized - invalid API key
 *       500:
 *         description: Server error
 */
router.post("/affiliate/get", pages.getAffiliateData);

/**
 * @swagger
 * /pages/referrals:
 *   post:
 *     tags: [Pages]
 *     summary: Get referrals and earnings data for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *               - key
 *               - user_id
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: ID of the panel
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *               user_id:
 *                 type: string
 *                 description: User unique ID
 *     responses:
 *       200:
 *         description: Referrals data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   description: Orders referred by the user, including earnings per order
 *                 totalReferrals:
 *                   type: integer
 *                   description: Total number of referrals
 *                 totalEarnings:
 *                   type: number
 *                   description: Total earnings from referrals
 *       401:
 *         description: Unauthorized - invalid API key
 *       500:
 *         description: Server error
 */
router.post("/referrals", pages.getReferrals);

/**
 * @swagger
 * /pages/enabled:
 *   post:
 *     tags: [Pages]
 *     summary: Get list of enabled features/pages for a panel (e.g., affiliate, refills)
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
 *                 description: ID of the panel
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Enabled pages/features retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of enabled features/pages
 *       401:
 *         description: Unauthorized - invalid API key
 *       500:
 *         description: Server error
 */
router.post("/enabled", pages.getRaeData);

module.exports = router;
