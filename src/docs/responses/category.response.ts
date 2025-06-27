import { z } from "zod";
import { CategorySchema } from "../../schemas/category.schema";

export const CategoryListResponse = {
  description: "List of all categories",
  content: {
    "application/json": {
      schema: z.array(CategorySchema),
    },
  },
};

export const CategoryCreatedResponse = {
  description: "Successfully created a category",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Category added successfully."),
        category: CategorySchema,
      }),
    },
  },
};

export const CategoryUpdatedResponse = {
  description: "Successfully updated a category",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Category updated successfully."),
        category: CategorySchema,
      }),
    },
  },
};

export const CategoryObject = {
  description: "Single category object",
  content: {
    "application/json": {
      schema: z.object({
        category: CategorySchema,
      }),
    },
  },
};
