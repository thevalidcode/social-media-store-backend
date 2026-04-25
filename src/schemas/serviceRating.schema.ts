import { z } from "zod";

export const CreateServiceRatingSchema = z.object({
  serviceUid: z.string().uuid("Service UID must be a valid UUID"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  review: z.string().max(500).optional(),
});

export const UpdateServiceRatingSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().max(500).optional(),
});

export const ApproveServiceRatingSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export type CreateServiceRatingInput = z.infer<
  typeof CreateServiceRatingSchema
>;
export type UpdateServiceRatingInput = z.infer<
  typeof UpdateServiceRatingSchema
>;
export type ApproveServiceRatingInput = z.infer<
  typeof ApproveServiceRatingSchema
>;
