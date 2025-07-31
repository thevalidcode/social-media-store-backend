import express from "express";
import multer from "multer";
const router = express.Router();

import * as uploads from "../controllers/files.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import { limitUploads } from "../middleware/ratelimit/files.ratelimit";
import { isAdmin } from "../middleware/authorize";

// Using memory storage for direct S3 uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  "/image",
  authenticate,
  limitUploads,
  upload.single("image"),
  isAdmin,
  uploads.uploadImage
);

export default router;
