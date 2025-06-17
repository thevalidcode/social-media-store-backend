const express = require("express");
const router = express.Router();
const users = require("../controllers/users");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /user/delete:
 *   post:
 *     summary: Delete a user by uid
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User uid and panel_id to identify the user to delete
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *                 description: User unique identifier
 *               panel_id:
 *                 type: number
 *                 description: Panel identifier
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing user uid or invalid request
 *       500:
 *         description: Server error
 */
router.post("/delete", users.deleteUser);

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User details for account creation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - panel_id
 *               - email
 *               - username
 *               - password
 *             properties:
 *               panel_id:
 *                 type: number
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               ref:
 *                 type: string
 *                 description: Optional referral user id
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Validation error (missing fields or duplicate email/username)
 *       500:
 *         description: Server error
 */
router.post("/create", users.createUser);

/**
 * @swagger
 * /user/get:
 *   post:
 *     summary: Get all users for a given panel
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Panel ID to retrieve users
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
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Missing panel_id
 */
router.post("/get", users.getUsers);

/**
 * @swagger
 * /user/edit/email:
 *   post:
 *     summary: Update user email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User uid and new email
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - email
 *             properties:
 *               uid:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       400:
 *         description: Missing uid or email
 *       500:
 *         description: Server error
 */
router.post("/edit/email", users.editUserEmail);

/**
 * @swagger
 * /user/edit/password:
 *   post:
 *     summary: Update user password (admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User uid, new password, admin API key
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - password
 *               - key
 *             properties:
 *               uid:
 *                 type: string
 *               password:
 *                 type: string
 *               key:
 *                 type: string
 *                 description: Admin API key for authentication
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/edit/password", users.editUserPassword);

/**
 * @swagger
 * /user/update/balance:
 *   post:
 *     summary: Update user balance (admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Balance update details with admin API key
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedUser
 *               - balanceAction
 *               - balanceInput
 *               - idCounter
 *               - updatedBalance
 *               - key
 *             properties:
 *               selectedUser:
 *                 type: object
 *                 description: User object with uid field
 *                 properties:
 *                   uid:
 *                     type: string
 *               balanceAction:
 *                 type: string
 *                 description: Action on balance (e.g. credit, debit)
 *               balanceInput:
 *                 type: number
 *                 description: Amount to update
 *               idCounter:
 *                 type: string
 *                 description: Transaction ID counter
 *               updatedBalance:
 *                 type: number
 *                 description: New balance after update
 *               key:
 *                 type: string
 *                 description: Admin API key
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *       400:
 *         description: Missing required fields or error updating balance
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/update/balance", users.updateUserBalance);

/**
 * @swagger
 * /user/admin/authenticate:
 *   post:
 *     summary: Authenticate an admin user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Admin email and password
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - panel_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *       400:
 *         description: Incorrect login details
 */
router.post("/admin/authenticate", users.adminAuthentication);

/**
 * @swagger
 * /user/authenticate:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User email and password
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - panel_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Incorrect login details or banned user
 */
router.post("/authenticate", users.authenticate);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Send password reset verification code to user email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: User email and panel_id
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - panel_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Missing fields or user does not exist
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", users.sendForgetPasswdCode);

/**
 * @swagger
 * /user/forgot-password/confirm:
 *   post:
 *     summary: Confirm password reset verification code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Verification code, email, and panel_id
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - email
 *               - panel_id
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Invalid or expired code or missing fields
 *       404:
 *         description: No verification codes found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password/confirm", users.confirmForgetPasswdCode);

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset user password after verifying code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       description: Verification code, email, new password, and panel_id
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - email
 *               - password
 *               - panel_id
 *             properties:
 *               code:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               panel_id:
 *                 type: number
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid code or missing fields
 *       404:
 *         description: Verification code not found
 *       500:
 *         description: Server error
 */
router.post("/reset-password", users.resetPassword);

module.exports = router;
