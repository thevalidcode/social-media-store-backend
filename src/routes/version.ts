import express from "express";
import { API_VERSION } from "../version";

const router = express.Router();

router.get("/version", (_, res) => {
  res.json({ version: API_VERSION });
});

export default router;
