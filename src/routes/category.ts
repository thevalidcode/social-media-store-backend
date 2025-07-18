import express from "express";
const router = express.Router();
import * as categories from "../controllers/category";
import { authenticate } from "../middleware/authenticate";
import {
  limitPublicGet,
  limitCategoryMutations,
} from "../middleware/ratelimit/category";

router.get("/", limitPublicGet, categories.getCategories);
router.get("/:category_id", categories.getCategoryByID);

router.post("/", authenticate, limitCategoryMutations, categories.addCategory);
router.patch(
  "/",
  authenticate,
  limitCategoryMutations,
  categories.updateCategory
);
router.delete(
  "/",
  authenticate,
  limitCategoryMutations,
  categories.deleteCategory
);
router.delete(
  "/multiple",
  authenticate,
  limitCategoryMutations,
  categories.deleteMultipleCategory
);

export default router;
