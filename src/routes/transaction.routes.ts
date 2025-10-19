import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as transactions from "../controllers/transaction.controllers";

const router = express.Router();

router.get("/", authenticateUser, transactions.getTransactionsForUser);
router.get("/admin", authenticateAdmin, transactions.getTransactionsForAdmin);

export default router;
