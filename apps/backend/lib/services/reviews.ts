/**
 * Review Service - Handles room reviews and ratings
 * Implements: Creating, reading, updating, and managing room reviews
 */

import { createClient } from "@supabase/supabase-js";
import {
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewFilterSchema,
} from "@unilodge/shared/schemas";
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewFilter,
} from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ReviewService {
  /**
   * Create a new review for a room
   */
  static async createReview(input: CreateReviewInput, userId: string) {
    const parsed = CreateReviewSchema.parse(input);

    try {
      // Check if user already reviewed this room
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("room_id", parsed.roomId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

      if (existing) {
        throw new Error("You have already reviewed this room");
      }

      // Create review
      const { data: review, error } = await supabase
        .from("reviews")
        .insert({
          room_id: parsed.roomId,
          user_id: userId,
          rating: parsed.rating,
          comment: parsed.comment,
        })
        .select("*, user_id(full_name)")
        .single();

      if (error) throw error;

      return review;
    } catch (error: any) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Get reviews for a room with pagination
   */
  static async getRoomReviews(
    roomId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;

    try {
      const { data: reviews, count, error } = await supabase
        .from("reviews")
        .select("*, user_id(full_name)", { count: "exact" })
        .eq("room_id", roomId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Calculate average rating
      const avgRating =
        reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

      return {
        reviews: reviews || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
        averageRating: Math.round(avgRating * 10) / 10,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }

  /**
   * Get a single review
   */
  static async getReview(reviewId: string) {
    try {
      const { data: review, error } = await supabase
        .from("reviews")
        .select("*, user_id(full_name)")
        .eq("id", reviewId)
        .is("deleted_at", null)
        .single();

      if (error) throw error;

      return review;
    } catch (error: any) {
      throw new Error(`Failed to fetch review: ${error.message}`);
    }
  }

  /**
   * Update a review
   */
  static async updateReview(
    reviewId: string,
    input: UpdateReviewInput,
    userId: string
  ) {
    const parsed = UpdateReviewSchema.parse(input);

    try {
      // Check ownership
      const { data: review } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      if (review?.user_id !== userId) {
        throw new Error("Unauthorized to update this review");
      }

      // Update review
      const { data: updated, error } = await supabase
        .from("reviews")
        .update({
          rating: parsed.rating,
          comment: parsed.comment,
          updated_at: new Date(),
        })
        .eq("id", reviewId)
        .select("*, user_id(full_name)")
        .single();

      if (error) throw error;

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Soft delete a review (mark as deleted)
   */
  static async deleteReview(reviewId: string, userId: string) {
    try {
      // Check ownership
      const { data: review } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      if (review?.user_id !== userId) {
        throw new Error("Unauthorized to delete this review");
      }

      // Soft delete
      const { error } = await supabase
        .from("reviews")
        .update({ deleted_at: new Date() })
        .eq("id", reviewId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    try {
      const { data: reviews, count, error } = await supabase
        .from("reviews")
        .select("*, room_id(room_number, base_price)", { count: "exact" })
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        reviews: reviews || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch user reviews: ${error.message}`);
    }
  }

  /**
   * Get reviews by filters
   */
  static async getReviewsByFilter(filters: Partial<ReviewFilter>) {
    const parsed = ReviewFilterSchema.parse(filters);
    const offset = (parsed.page - 1) * parsed.limit;

    try {
      let query = supabase
        .from("reviews")
        .select("*, user_id(full_name), room_id(room_number)", {
          count: "exact",
        })
        .is("deleted_at", null);

      if (parsed.roomId) {
        query = query.eq("room_id", parsed.roomId);
      }

      if (parsed.userId) {
        query = query.eq("user_id", parsed.userId);
      }

      if (parsed.minRating) {
        query = query.gte("rating", parsed.minRating);
      }

      const { data: reviews, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + parsed.limit - 1);

      if (error) throw error;

      return {
        reviews: reviews || [],
        pagination: {
          total: count || 0,
          page: parsed.page,
          limit: parsed.limit,
          totalPages: Math.ceil((count || 0) / parsed.limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch reviews by filter: ${error.message}`);
    }
  }

  /**
   * Get helpful count for a review
   */
  static async markReviewHelpful(reviewId: string, userId: string) {
    try {
      const { error } = await supabase
        .from("review_helpful")
        .insert({
          review_id: reviewId,
          user_id: userId,
        });

      // Don't throw if already marked - just ignore
      if (error && !error.message.includes("duplicate")) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to mark review as helpful: ${error.message}`);
    }
  }
}
