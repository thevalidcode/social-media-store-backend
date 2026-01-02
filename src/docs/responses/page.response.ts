import { z } from "zod";
import { PageSchema } from "../../schemas/page.schema";

export const PageListResponse = {
  description: "List of all pages",
  content: {
    "application/json": {
      schema: z.array(PageSchema),
    },
  },
};

export const PageCreatedResponse = {
  description: "Successfully created a page",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Page created successfully."),
        page: PageSchema,
      }),
    },
  },
};

export const PageUpdatedResponse = {
  description: "Successfully updated a page",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Page updated successfully."),
        page: PageSchema,
      }),
    },
  },
};

export const PageObject = {
  description: "Single page object",
  content: {
    "application/json": {
      schema: PageSchema,
    },
  },
};
