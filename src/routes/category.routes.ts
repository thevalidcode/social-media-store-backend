import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers";
import { authenticateAdmin } from "../middleware/auth";

import {
  limitPublicGet,
  limitCategoryMutations,
} from "../middleware/ratelimit/category.ratelimit";

router.get("/", limitPublicGet, categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);

router.post(
  "/",
  authenticateAdmin,
  limitCategoryMutations,
  categories.addCategory
);
router.patch(
  "/",
  authenticateAdmin,
  limitCategoryMutations,
  categories.updateCategory
);
router.delete(
  "/",
  authenticateAdmin,
  limitCategoryMutations,
  categories.deleteCategory
);
router.delete(
  "/multiple",
  authenticateAdmin,
  limitCategoryMutations,
  categories.deleteMultipleCategory
);

export default router;
