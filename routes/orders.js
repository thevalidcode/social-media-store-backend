/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and stats
 */

const express = require("express");
const router = express.Router();
const {
  sendOrderToMainServer,
  resendOrder,
  fetchOrders,
  fetchPendingSize,
  fetchActiveSize,
  fetchFailedSize,
  fetchPartialSize,
  fetchCancelledSize,
  fetchCompletedSize,
  fetchOrdersSize,
  editOrder,
} = require("../controllers/orders");

/**
 * @swagger
 * /order/send:
 *   post:
 *     summary: Send a new order to the main server
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderData
 *               - panel_id
 *               - user_uid
 *               - userBal
 *             properties:
 *               orderData:
 *                 type: object
 *                 description: Order details
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *               user_uid:
 *                 type: string
 *               userBal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order sent successfully
 *         content:
 *           application/json:
 *             example: { response: "Sent to server" }
 *       400:
 *         description: Missing or invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/send", sendOrderToMainServer);

/**
 * @swagger
 * /order/resend:
 *   post:
 *     summary: Resend an order to the main server
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderData
 *               - panel_id
 *             properties:
 *               orderData:
 *                 type: object
 *                 description: Order details to resend
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Order resent successfully
 *         content:
 *           application/json:
 *             example: { response: "Sent to server" }
 *       400:
 *         description: Missing or invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/resend", resendOrder);

/**
 * @swagger
 * /order/get:
 *   post:
 *     summary: Fetch all orders sorted by ID descending
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *                 description: Admin API key for authentication
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Missing input parameters or invalid API key
 *       401:
 *         description: Unauthorized
 */
router.post("/get", fetchOrders);

/**
 * @swagger
 * /order/pending/size:
 *   post:
 *     summary: Get count of orders with status Pending
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of pending orders
 *         content:
 *           application/json:
 *             example: { size: 5 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/pending/size", fetchPendingSize);

/**
 * @swagger
 * /order/active/size:
 *   post:
 *     summary: Get count of orders with status In progress
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of active orders
 *         content:
 *           application/json:
 *             example: { size: 10 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/active/size", fetchActiveSize);

/**
 * @swagger
 * /order/failed/size:
 *   post:
 *     summary: Get count of orders with status Failed
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of failed orders
 *         content:
 *           application/json:
 *             example: { size: 2 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/failed/size", fetchFailedSize);

/**
 * @swagger
 * /order/partial/size:
 *   post:
 *     summary: Get count of orders with status Partial
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of partial orders
 *         content:
 *           application/json:
 *             example: { size: 1 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/partial/size", fetchPartialSize);

/**
 * @swagger
 * /order/cancelled/size:
 *   post:
 *     summary: Get count of orders with status Canceled
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of canceled orders
 *         content:
 *           application/json:
 *             example: { size: 3 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/cancelled/size", fetchCancelledSize);

/**
 * @swagger
 * /order/completed/size:
 *   post:
 *     summary: Get count of orders with status Completed
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Number of completed orders
 *         content:
 *           application/json:
 *             example: { size: 15 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/completed/size", fetchCompletedSize);

/**
 * @swagger
 * /order/all/size:
 *   post:
 *     summary: Get total count of all orders
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *             properties:
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *     responses:
 *       200:
 *         description: Total number of orders
 *         content:
 *           application/json:
 *             example: { size: 50 }
 *       400:
 *         description: Missing key
 *       401:
 *         description: Invalid API key
 */
router.post("/all/size", fetchOrdersSize);

/**
 * @swagger
 * /order/edit:
 *   post:
 *     summary: Edit or update an order status and details
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - panel_id
 *               - orderData
 *               - user_uid
 *             properties:
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               panel_id:
 *                 type: number
 *                 description: Panel ID for the order
 *               orderData:
 *                 type: object
 *                 description: Updated order details
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [Completed, Canceled, Partial, Pending, In progress, Failed]
 *                   price:
 *                     type: number
 *                   provider_order_id:
 *                     type: string
 *                   charge:
 *                     type: number
 *                   drip_feed:
 *                     type: boolean
 *                   qty:
 *                     type: number
 *                   startCount:
 *                     type: number
 *                   remains:
 *                     type: number
 *                   partial:
 *                     type: number
 *               user_uid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             example: { response: "Order updated" }
 *       400:
 *         description: Missing required fields or invalid input
 *       401:
 *         description: Unauthorized (invalid API key)
 *       500:
 *         description: Internal server error
 */
router.post("/edit", editOrder);

module.exports = router;
