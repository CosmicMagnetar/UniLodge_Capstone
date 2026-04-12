/**
 * Recommendation Engine Service
 * AI-powered room recommendations based on user preferences and behavior
 */

import { createClient } from "@supabase/supabase-js";
import { RoomService } from "./rooms";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserPreferences {
  budget: number;
  roomType?: string;
  amenities?: string[];
  university?: string;
  nearbyUniversities?: string[];
}

interface RecommendedRoom {
  id: string;
  roomNumber: string;
  basePrice: number;
  matchScore: number;
  reasoning: string;
  image?: string;
}

export class RecommendationEngine {
  /**
   * Get personalized recommendations for a user
   */
  static async getPersonalizedRecommendations(
    userId: string,
    preferences?: Partial<UserPreferences>
  ): Promise<RecommendedRoom[]> {
    try {
      // Get user's booking history
      const { data: bookings } = await supabase
        .from("bookings")
        .select("room_id, status")
        .eq("user_id", userId)
        .eq("status", "Confirmed")
        .limit(5);

      // Get user's reviews to understand preferences
      const { data: reviews } = await supabase
        .from("reviews")
        .select("room_id, rating")
        .eq("user_id", userId)
        .order("rating", { ascending: false });

      // Build user profile from history
      const userProfile = await this.buildUserProfile(
        userId,
        bookings || [],
        reviews || [],
        preferences
      );

      // Get recommendations
      const recommendations = await RoomService.getRecommendations(
        userProfile.budget,
        userProfile.roomType,
        userProfile.amenities
      );

      // Score and rank recommendations
      const scoredRecommendations = recommendations
        .map((room) => ({
          ...room,
          matchScore: this.calculateMatchScore(room, userProfile),
          reasoning: this.generateReasoning(room, userProfile),
        }))
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      return scoredRecommendations;
    } catch (error: any) {
      console.error("Failed to get recommendations:", error);
      return [];
    }
  }

  /**
   * Build user profile from booking and review history
   */
  private static async buildUserProfile(
    userId: string,
    bookings: any[],
    reviews: any[],
    overrides?: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    if (overrides && Object.keys(overrides).length > 0) {
      return {
        budget: overrides.budget || 600,
        roomType: overrides.roomType,
        amenities: overrides.amenities || [],
        university: overrides.university,
        ...overrides,
      };
    }

    // Default profile
    return {
      budget: 600,
      roomType: undefined,
      amenities: [],
    };
  }

  /**
   * Calculate match score based on user preferences
   */
  private static calculateMatchScore(
    room: any,
    userProfile: UserPreferences
  ): number {
    let score = 50; // Base score

    // Price match (30 points)
    if (room.base_price <= userProfile.budget) {
      const priceRatio = room.base_price / userProfile.budget;
      score += 30 * (1 - Math.abs(priceRatio - 0.8)); // Favor rooms at 80% of budget
    }

    // Type match (20 points)
    if (userProfile.roomType && room.type === userProfile.roomType) {
      score += 20;
    }

    // University match (20 points)
    if (
      userProfile.university &&
      room.university === userProfile.university
    ) {
      score += 20;
    }

    // Amenities match (20 points)
    if (userProfile.amenities && userProfile.amenities.length > 0) {
      const matchedAmenities = userProfile.amenities.filter((a) =>
        room.amenities?.includes(a)
      ).length;
      score += (matchedAmenities / userProfile.amenities.length) * 20;
    }

    // Rating bonus (10 points)
    if (room.rating) {
      score += (room.rating / 5) * 10;
    }

    // Cap score at 100
    return Math.min(100, Math.round(score) / 100);
  }

  /**
   * Generate human-readable reasoning for recommendation
   */
  private static generateReasoning(
    room: any,
    userProfile: UserPreferences
  ): string {
    const reasons: string[] = [];

    if (room.base_price <= userProfile.budget) {
      reasons.push(`Within your budget of $${userProfile.budget}`);
    }

    if (userProfile.roomType && room.type === userProfile.roomType) {
      reasons.push(`Matches your preferred ${room.type} room`);
    }

    if (userProfile.university && room.university === userProfile.university) {
      reasons.push(`Located near ${room.university}`);
    }

    if (room.rating && room.rating >= 4.5) {
      reasons.push(`Highly rated (${room.rating}/5 stars)`);
    }

    if (room.amenities && room.amenities.length > 0) {
      reasons.push(`Includes ${room.amenities.slice(0, 2).join(", ")}`);
    }

    return reasons.length > 0
      ? reasons.join(". ") + "."
      : "Good match for your preferences.";
  }

  /**
   * Get trending rooms
   */
  static async getTrendingRooms(): Promise<RecommendedRoom[]> {
    try {
      const { data: bookingStats } = await supabase
        .from("bookings")
        .select("room_id")
        .eq("status", "Confirmed");

      if (!bookingStats) {
        return [];
      }

      // Count bookings per room
      const roomBookingCounts: Record<string, number> = {};
      bookingStats.forEach((booking) => {
        roomBookingCounts[booking.room_id] =
          (roomBookingCounts[booking.room_id] || 0) + 1;
      });

      // Get top 6 most booked rooms
      const topRoomIds = Object.entries(roomBookingCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([id]) => id);

      if (topRoomIds.length === 0) {
        return [];
      }

      const { data: rooms } = await supabase
        .from("rooms")
        .select("*")
        .in("id", topRoomIds);

      return (
        rooms?.map((room) => ({
          id: room.id,
          roomNumber: room.room_number,
          basePrice: room.base_price,
          matchScore: Math.round(
            ((roomBookingCounts[room.id] || 0) / bookingStats.length) * 100
          ) / 100,
          reasoning: `Booked ${roomBookingCounts[room.id] || 0} times`,
          image: room.image_url,
        })) || []
      );
    } catch (error) {
      console.error("Failed to get trending rooms:", error);
      return [];
    }
  }

  /**
   * Get similar rooms
   */
  static async getSimilarRooms(roomId: string): Promise<RecommendedRoom[]> {
    try {
      const { data: baseRoom } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (!baseRoom) {
        return [];
      }

      const similar = await RoomService.getRecommendations(
        baseRoom.base_price * 1.2,
        baseRoom.type,
        baseRoom.amenities || []
      );

      return (
        similar
          ?.filter((r) => r.id !== roomId)
          .map((room) => ({
            id: room.id,
            roomNumber: room.room_number,
            basePrice: room.base_price,
            matchScore: 0.85, // Default similarity score
            reasoning: `Similar to ${baseRoom.room_number}`,
            image: room.image_url,
          }))
          .slice(0, 6) || []
      );
    } catch (error) {
      console.error("Failed to get similar rooms:", error);
      return [];
    }
  }
}
