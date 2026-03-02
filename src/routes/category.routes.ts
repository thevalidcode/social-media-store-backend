import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticateAdmin } from "../middleware/auth";

import { limitCategoryMutations } from "../middleware/ratelimit/category.ratelimit";
import { requireActiveSubscription } from "../middleware/subscription.middleware";

router.get("/", categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);

router.post(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitCategoryMutations,
  categories.addCategory,
);
router.patch(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitCategoryMutations,
  categories.updateCategory,
);
router.delete(
  "/",
  authenticateAdmin,
  requireActiveSubscription,
  limitCategoryMutations,
  categories.deleteCategory,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  requireActiveSubscription,
  limitCategoryMutations,
  categories.deleteMultipleCategory,
);

export default router;
