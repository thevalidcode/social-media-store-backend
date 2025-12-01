import { z } from "zod";
import {} from "../../schemas/files.schema";

export const UploadedImageSuccess = {
  description: "Image uploaded successfully",
  content: {
    "application/json": {
      schema: z.object({
        message: z.string(),
        url: z.string().url(),
      }),
    },
  },
};

export const ImagesLogs = {
  description: "Image uploaded successfully",
  content: {
    "application/json": {
      schema: z.object({
        images: z.array(
          z.object({
            id: z.number(),
            storeScopedId: z.number(),
            filename: z.string(),
            mimetype: z.string(),
            collection: z.string(),
            url: z.string().url(),
            timestamp: z.string(),
            size: z.string(),
            uid: z.string(),
          })
        ),
      }),
    },
  },
};
