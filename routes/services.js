const express = require("express");
const router = express.Router();
const services = require("../controllers/services");

/**
 * @swagger
 * /service/import:
 *   post:
 *     summary: Import services from external provider
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [selectedServices, panel_id, key]
 *             properties:
 *               selectedServices:
 *                 type: array
 *                 items:
 *                   type: integer
 *               panel_id:
 *                 type: number
 *               key:
 *                 type: string
 *               importPercent:
 *                 type: number
 *               categoryOption:
 *                 type: object
 *               providerOption:
 *                 type: object
 *     responses:
 *       200:
 *         description: Services imported successfully
 *       400:
 *         description: Missing values
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.post("/import", services.importServices);

/**
 * @swagger
 * /service/edit:
 *   post:
 *     summary: Update a service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [panel_id, serviceUid, key, serviceName]
 *             properties:
 *               panel_id: { type: number }
 *               serviceUid: { type: string }
 *               key: { type: string }
 *               serviceName: { type: string }
 *               serviceMin: { type: integer }
 *               serviceMax: { type: integer }
 *               serviceDescription: { type: string }
 *               pricePercent: { type: number }
 *               actualPrice: { type: number }
 *               categoryOption: { type: object }
 *               serviceType: { type: string }
 *               sync_quantity: { type: boolean }
 *               drip_feed: { type: boolean }
 *               cancel: { type: boolean }
 *               refill: { type: boolean }
 *               refill_days: { type: integer }
 *               sync_cat_and_name: { type: boolean }
 *               status: { type: string }
 *               oldServiceName: { type: string }
 *     responses:
 *       200:
 *         description: Updated Successfully
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.post("/edit", services.updateService);

/**
 * @swagger
 * /service/get-service-id:
 *   post:
 *     summary: Get a single service by ID
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [panel_id, key, service_id]
 *             properties:
 *               panel_id: { type: number }
 *               key: { type: string }
 *               service_id: { type: integer }
 *     responses:
 *       200:
 *         description: Service found
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.post("/get-service-id", services.getServiceByID);

/**
 * @swagger
 * /service/get:
 *   post:
 *     summary: Get active services
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [panel_id]
 *             properties:
 *               panel_id: { type: number }
 *     responses:
 *       200:
 *         description: List of active services
 */
router.post("/get", services.getServices);

/**
 * @swagger
 * /service/category/edit:
 *   post:
 *     summary: Update a service category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryUid, categoryName, panel_id, key]
 *             properties:
 *               categoryUid: { type: string }
 *               categoryName: { type: string }
 *               initialName: { type: string }
 *               panel_id: { type: number }
 *               key: { type: string }
 *               categoryStatus: { type: boolean }
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.post("/category/edit", services.updateCategory);

/**
 * @swagger
 * /service/update/position:
 *   post:
 *     summary: Update service positions
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data, panel_id, key]
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     uid: { type: string }
 *                     position: { type: integer }
 *               panel_id: { type: number }
 *               key: { type: string }
 *     responses:
 *       200:
 *         description: Position updated
 *       401:
 *         description: Invalid key
 *       500:
 *         description: Failed to update positions
 */
router.post("/update/position", services.updatePosition);

/**
 * @swagger
 * /service/category/update/position:
 *   post:
 *     summary: Update category positions
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data, panel_id, key]
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     uid: { type: string }
 *                     position: { type: integer }
 *               panel_id: { type: number }
 *               key: { type: string }
 *     responses:
 *       200:
 *         description: Category positions updated
 *       401:
 *         description: Invalid key
 *       500:
 *         description: Failed to update category positions
 */
router.post("/category/update/position", services.updateCatPosition);

/**
 * @swagger
 * /service/category/add:
 *   post:
 *     summary: Add Category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data, panel_id, key]
 *             properties:
 *               data:
 *                 type: object
 *               panel_id: { type: number }
 *               key: { type: string }
 *     responses:
 *       200:
 *         description: Category positions updated
 *       401:
 *         description: Invalid key
 *       500:
 *         description: Failed to update category positions
 */
router.post("/category/add", services.addCategory);

module.exports = router;
