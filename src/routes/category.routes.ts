import express from "express";
const router = express.Router();
import * as categories from "../controllers/category.controllers"
  ;
import { authenticate } from "../middleware/authenticate";
import {
  limitPublicGet,
  limitCategoryMutations,
} from "../middleware/ratelimit/category.ratelimit";
import { isAdmin } from "../middleware/authorize";

router.get("/", limitPublicGet, categories.getCategories);
router.get("/:categoryId", categories.getCategoryByID);

router.post("/", authenticate, limitCategoryMutations, isAdmin, categories.addCategory);
router.patch(
  "/",
  authenticate,
  limitCategoryMutations, isAdmin,
  categories.updateCategory
);
router.delete(
  "/",
  authenticate,
  limitCategoryMutations, isAdmin,
  categories.deleteCategory
);
router.delete(
  "/multiple",
  authenticate,
  limitCategoryMutations, isAdmin,
  categories.deleteMultipleCategory
);

export default router;
