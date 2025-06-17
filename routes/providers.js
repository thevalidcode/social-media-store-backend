const express = require("express");
const router = express.Router();
const providers = require("../controllers/providers");

/**
 * @swagger
 * tags:
 *   name: Providers
 *   description: API to manage providers and services
 */

/**
 * @swagger
 * /providers/services/get:
 *   post:
 *     summary: Get services from a provider
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - provider
 *               - panel_id
 *             properties:
 *               adminKey:
 *                 type: string
 *                 description: Admin API key for authentication
 *               key:
 *                 type: string
 *                 description: Provider API key
 *               provider:
 *                 type: string
 *                 description: Provider base URL or domain
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *     responses:
 *       200:
 *         description: List of services
 *       400:
 *         description: Missing some values
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/services/get", providers.getServices);

/**
 * @swagger
 * /providers/get:
 *   post:
 *     summary: Get all providers for a panel
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminKey
 *               - panel_id
 *             properties:
 *               adminKey:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *     responses:
 *       200:
 *         description: List of providers
 *       400:
 *         description: Missing adminKey or panel_id
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/get", providers.getAllProviders);

/**
 * @swagger
 * /providers/get/id:
 *   post:
 *     summary: Get provider by UID
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - adminKey
 *               - panel_id
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Provider UID
 *               adminKey:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *     responses:
 *       200:
 *         description: Provider details
 *       400:
 *         description: Missing parameters or provider not found
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/get/id", providers.getAllProvidersById);

/**
 * @swagger
 * /providers/update:
 *   post:
 *     summary: Update a provider by UID
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - adminKey
 *             properties:
 *               uid:
 *                 type: string
 *               adminKey:
 *                 type: string
 *               url:
 *                 type: string
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *               percentage:
 *                 type: number
 *               sync:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *       400:
 *         description: Missing parameters or provider not found
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/update", providers.updateProvider);

/**
 * @swagger
 * /providers/delete:
 *   post:
 *     summary: Delete a provider by UID
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - adminKey
 *               - panel_id
 *             properties:
 *               uid:
 *                 type: string
 *               adminKey:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *     responses:
 *       200:
 *         description: Provider deleted successfully
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/delete", providers.deleteProvider);

/**
 * @swagger
 * /providers/create:
 *   post:
 *     summary: Add a new provider
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminKey
 *             properties:
 *               adminKey:
 *                 type: string
 *               url:
 *                 type: string
 *               key:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *               idCounter:
 *                 type: string
 *               sync:
 *                 type: boolean
 *               percentage:
 *                 type: number
 *     responses:
 *       200:
 *         description: Provider added successfully
 *       400:
 *         description: Missing parameters or failed to add
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/create", providers.appProvider);

/**
 * @swagger
 * /providers/get/currency:
 *   post:
 *     summary: Get currency and balance info for a provider or service
 *     tags: [Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *               provider:
 *                 type: string
 *               panel_id:
 *                 type: number
 *                 description: Panel ID to associate with the request
 *               service_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Currency and balance info
 *       400:
 *         description: Missing parameters
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/get/currency", providers.getCurrency);

module.exports = router;
