const express = require("express");
const router = express.Router();
const crud = require("../controllers/crud");

/**
 * @swagger
 * /crud/get/docs:
 *   post:
 *     summary: Retrieve documents from a collection, optionally filtered by panel_id and query
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Required panel ID for scoped data
 *               collection:
 *                 type: string
 *                 description: Collection name
 *               query:
 *                 type: object
 *                 description: Query filter object
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Returns matched documents
 *       400:
 *         description: Unauthorized or bad request
 *
 * /crud/add/doc:
 *   post:
 *     summary: Add a single document to a collection
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - data
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Required panel ID for scoped data
 *               collection:
 *                 type: string
 *                 description: Collection name
 *               data:
 *                 type: object
 *                 description: Document data to add
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Document added confirmation
 *       400:
 *         description: Unauthorized or bad request
 *
 * /crud/delete/doc:
 *   post:
 *     summary: Delete a single document by UID from a collection
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - uid
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Required panel ID for scoped data
 *               collection:
 *                 type: string
 *                 description: Collection name
 *               uid:
 *                 type: string
 *                 description: Unique document ID to delete
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Document deleted confirmation
 *       400:
 *         description: Unauthorized or bad request
 *
 * /crud/update/doc:
 *   post:
 *     summary: Update a single document by UID in a collection
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - uid
 *               - data
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Required panel ID for scoped data
 *               collection:
 *                 type: string
 *                 description: Collection name
 *               uid:
 *                 type: string
 *                 description: Unique document ID to update
 *               data:
 *                 type: object
 *                 description: Updated fields for the document
 *               key:
 *                 type: string
 *                 description: API key for authentication
 *     responses:
 *       200:
 *         description: Document updated confirmation
 *       400:
 *         description: Unauthorized or bad request
 *
 * /crud/add/docs:
 *   post:
 *     summary: Add multiple documents to a collection
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - data
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *                 description: Required panel ID for scoped data
 *               collection:
 *                 type: string
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Array of documents to add
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documents added confirmation
 *       400:
 *         description: Unauthorized or bad request
 *
 * /crud/delete/docs:
 *   post:
 *     summary: Delete multiple documents by UID array from a collection
 *     tags:
 *       - CRUD
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - panel_id
 *               - uids
 *               - key
 *             properties:
 *               panel_id:
 *                 type: number
 *               collection:
 *                 type: string
 *               uids:
 *                 type: array
 *                 items:
 *                   type: string
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documents deleted confirmation
 *       400:
 *         description: Unauthorized or bad request
 */

router.post("/get/docs", crud.getData);
router.post("/add/doc", crud.addData);
router.post("/delete/doc", crud.deleteData);
router.post("/update/doc", crud.updateData);
router.post("/add/docs", crud.addMultipleDocs);
router.post("/delete/docs", crud.deleteMultipleDocs);

module.exports = router;
