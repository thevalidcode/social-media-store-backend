import { UploadImageRequest } from "../../schemas/files.schema";
import { registry } from "../components/registry";
import { ServerError, Forbidden } from "../responses/common.response";
import { UploadedImageSuccess, ImagesLogs } from "../responses/files.response";

// POST /files/image
registry.registerPath({
  method: "post",
  path: "/files/image",
  summary: "Upload an image for a store",
  description:
    "Allows an authenticated admin to upload an image file (e.g., logo, banner) associated with a specific store. The file must be sent using multipart/form-data.",
  tags: ["Files"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              image: {
                type: "string",
                format: "binary",
                description: "The image file to upload (JPEG, PNG, WebP, etc.)",
              },
              collection: {
                type: "string",
                description:
                  "The collection or category under which the image should be stored (e.g., blogs, users)",
                example: "users",
              },
            },
            required: ["image", "collection"],
          },
        },
      },
    },
  },
  responses: {
    200: UploadedImageSuccess,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/files/image/logs",
  summary: "Get previous image upload logs",
  tags: ["Files"],
  security: [{ CookieAuth: [] }],
  request: {
    query: UploadImageRequest,
  },
  responses: {
    200: ImagesLogs,
    403: Forbidden,
    500: ServerError,
  },
});
