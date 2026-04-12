import { z } from "zod";

/**
 * Review types and schemas for validation
 */

export const ReviewSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export const CreateReviewSchema = ReviewSchema;

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

export const ReviewFilterSchema = z.object({
  roomId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Type exports
export type Review = z.infer<typeof ReviewSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type ReviewFilter = z.infer<typeof ReviewFilterSchema>;
