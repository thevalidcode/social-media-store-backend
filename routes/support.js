const express = require("express");
const router = express.Router();
const support = require("../controllers/support");

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Support ticket management
 */

/**
 * @swagger
 * /support/tickets:
 *   post:
 *     summary: Get all support tickets (admin only)
 *     tags: [Support]
 */
router.post("/tickets", support.getTickets);

/**
 * @swagger
 * /support/ticket/details:
 *   post:
 *     summary: Get details of a specific support ticket
 *     tags: [Support]
 */
router.post("/ticket/details", support.getTicketDetails);

/**
 * @swagger
 * /support/messages:
 *   post:
 *     summary: Get messages from a specific ticket (admin)
 *     tags: [Support]
 */
router.post("/messages", support.getMessages);

/**
 * @swagger
 * /support/send-message:
 *   post:
 *     summary: Admin sends a message to a ticket
 *     tags: [Support]
 */
router.post("/send-message", support.sendMessage);

/**
 * @swagger
 * /support/user-status:
 *   post:
 *     summary: Get user's support activity status
 *     tags: [Support]
 */
router.post("/user-status", support.getUserStatus);

/**
 * @swagger
 * /support/delete-tickets:
 *   post:
 *     summary: Delete support tickets (admin)
 *     tags: [Support]
 */
router.post("/delete-tickets", support.deleteTickets);

/**
 * @swagger
 * /support/mark-tickets-read:
 *   post:
 *     summary: Mark tickets as read (admin)
 *     tags: [Support]
 */
router.post("/mark-tickets-read", support.markAsRead);

/**
 * @swagger
 * /support/mark-tickets-solved:
 *   post:
 *     summary: Mark tickets as solved (admin)
 *     tags: [Support]
 */
router.post("/mark-tickets-solved", support.markAsSolved);

/**
 * @swagger
 * /support/get-unread-tickets-length:
 *   post:
 *     summary: Get number of unread tickets (admin)
 *     tags: [Support]
 */
router.post("/get-unread-tickets-length", support.getUnreadTicketsLength);

/**
 * @swagger
 * /support/get-user:
 *   post:
 *     summary: Get user details by ticket info (admin)
 *     tags: [Support]
 */
router.post("/get-user", support.getUser);

/**
 * @swagger
 * /support/user-get-tickets:
 *   post:
 *     summary: User gets their support tickets
 *     tags: [Support]
 */
router.post("/user-get-tickets", support.userGetTickets);

/**
 * @swagger
 * /support/user-get-messages:
 *   post:
 *     summary: User gets messages from a ticket
 *     tags: [Support]
 */
router.post("/user-get-messages", support.userGetMessages);

/**
 * @swagger
 * /support/user-send-message:
 *   post:
 *     summary: User sends a message to support
 *     tags: [Support]
 */
router.post("/user-send-message", support.userSendMessage);

/**
 * @swagger
 * /support/create-ticket:
 *   post:
 *     summary: User creates a support ticket
 *     tags: [Support]
 */
router.post("/create-ticket", support.createTicket);

module.exports = router;
