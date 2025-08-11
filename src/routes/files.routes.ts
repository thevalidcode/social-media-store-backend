import express from "express";
import multer from "multer";
const router = express.Router();

import * as uploads from "../controllers/files.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { limitUploads } from "../middleware/ratelimit/files.ratelimit";


// Using memory storage for direct S3 uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  "/image",
  authenticateAdmin,
  limitUploads,
  upload.single("image"),
  uploads.uploadImage
);

export default router;
