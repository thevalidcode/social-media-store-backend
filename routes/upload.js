const express = require("express");
const router = express.Router();
const uploadCon = require("../controllers/upload");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the directory where files will be saved
    cb(null, "/home/panels/assets/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  // Enable overwriting existing files
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Upload panel assets like images, favicons, and logos
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload a general image to the panel's assets folder
 *     tags: [Assets]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - panel_id
 *               - domain
 *               - useage
 *               - key
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               panel_id:
 *                 type: number
 *               domain:
 *                 type: string
 *               useage:
 *                 type: string
 *                 description: Purpose or usage path for the image (e.g., "users", "services")
 *               key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized - Invalid API key
 *       500:
 *         description: Server error
 */
router.post("/image", upload.single("file"), uploadCon.uploadImage);

/**
 * @swagger
 * /upload/favicon:
 *   post:
 *     summary: Upload a favicon for the panel
 *     tags: [Assets]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - panel_id
 *               - domain
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               panel_id:
 *                 type: number
 *               domain:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favicon uploaded and database updated
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Error in file rename or DB update
 */
router.post("/favicon", upload.single("file"), uploadCon.uploadFavicon);

/**
 * @swagger
 * /upload/logo:
 *   post:
 *     summary: Upload a logo image for the panel
 *     tags: [Assets]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - panel_id
 *               - domain
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               panel_id:
 *                 type: number
 *               domain:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Error in upload process
 */
router.post("/logo", upload.single("file"), uploadCon.uploadLogo);

module.exports = router;
