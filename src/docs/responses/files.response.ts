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
