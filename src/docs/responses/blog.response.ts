import { z } from "zod";
import { BlogSchema } from "../../schemas/blog.schema";

export const BlogListResponse = {
  description: "List of all blogs",
  content: {
    "application/json": {
      schema: z.array(BlogSchema),
    },
  },
};

export const BlogCreatedResponse = {
  description: "Successfully created a blog",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Blog added successfully."),
        blog: BlogSchema,
      }),
    },
  },
};

export const BlogUpdatedResponse = {
  description: "Successfully updated a blog",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Blog updated successfully."),
        blog: BlogSchema,
      }),
    },
  },
};

export const BlogObject = {
  description: "Single blog object",
  content: {
    "application/json": {
      schema: z.object({
        blog: BlogSchema,
      }),
    },
  },
};
