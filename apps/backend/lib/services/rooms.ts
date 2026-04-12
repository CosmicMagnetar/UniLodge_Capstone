/**
 * Room Service - Handles room listing, filtering, and management
 * Implements: Search, pagination, availability checking
 */

import { createClient } from "@supabase/supabase-js";
import {
  RoomFilterSchema,
  CreateRoomSchema,
  UpdateRoomSchema,
} from "@unilodge/shared/schemas";
import type {
  RoomFilterInput,
  CreateRoomInput,
  UpdateRoomInput,
} from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class RoomService {
  /**
   * Get rooms with advanced filtering, search, and pagination
   */
  static async getRooms(filters: Partial<RoomFilterInput> = {}) {
    const parsed = RoomFilterSchema.parse(filters);
    const offset = (parsed.page - 1) * parsed.limit;

    try {
      let query = supabase.from("rooms").select("*", { count: "exact" });

      // Apply filters
      if (parsed.type) query = query.eq("type", parsed.type);
      if (parsed.available !== undefined)
        query = query.eq("is_available", parsed.available);
      if (parsed.university) query = query.eq("university", parsed.university);

      // Filter by price range
      if (parsed.minPrice) query = query.gte("base_price", parsed.minPrice);
      if (parsed.maxPrice) query = query.lte("base_price", parsed.maxPrice);

      // Search functionality (across multiple fields)
      if (parsed.search) {
        const searchTerm = `%${parsed.search}%`;
        query = query.or(
          `room_number.ilike.${searchTerm},description.ilike.${searchTerm},university.ilike.${searchTerm}`
        );
      }

      // Sort and paginate
      const { data: rooms, count, error } = await query
        .order("room_number", { ascending: true })
        .range(offset, offset + parsed.limit - 1);

      if (error) throw error;

      return {
        rooms: rooms || [],
        pagination: {
          total: count || 0,
          page: parsed.page,
          limit: parsed.limit,
          totalPages: Math.ceil((count || 0) / parsed.limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch rooms: ${error.message}`);
    }
  }

  /**
   * Get single room with details and reviews
   */
  static async getRoom(roomId: string) {
    try {
      // Fetch room details
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError) throw roomError;

      // Fetch reviews for this room
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*, user_id(full_name)")
        .eq("room_id", roomId)
        .is("deleted_at", null);

      if (reviewsError) throw reviewsError;

      // Calculate average rating
      const avgRating =
        reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : room.rating;

      return {
        ...room,
        rating: avgRating,
        reviewCount: reviews?.length || 0,
        reviews: reviews || [],
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch room: ${error.message}`);
    }
  }

  /**
   * Create new room (admin/warden only)
   */
  static async createRoom(input: CreateRoomInput, userId: string) {
    const parsed = CreateRoomSchema.parse(input);

    try {
      // Check if room number already exists
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("room_number", parsed.roomNumber)
        .single();

      if (existing) {
        throw new Error("Room number already exists");
      }

      // Create room
      const { data: room, error } = await supabase
        .from("rooms")
        .insert({
          room_number: parsed.roomNumber,
          type: parsed.type,
          base_price: parsed.basePrice,
          amenities: parsed.amenities,
          description: parsed.description,
          capacity: parsed.capacity,
          image_url: parsed.imageUrl,
          university: parsed.university,
          is_available: true,
          approval_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      return room;
    } catch (error: any) {
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  /**
   * Update room details (admin/warden only)
   */
  static async updateRoom(
    roomId: string,
    input: UpdateRoomInput,
    userId: string
  ) {
    const parsed = UpdateRoomSchema.parse(input);

    try {
      const { data: room, error } = await supabase
        .from("rooms")
        .update({
          room_number: parsed.roomNumber,
          type: parsed.type,
          base_price: parsed.basePrice,
          amenities: parsed.amenities,
          description: parsed.description,
          capacity: parsed.capacity,
          image_url: parsed.imageUrl,
          updated_at: new Date(),
        })
        .eq("id", roomId)
        .select()
        .single();

      if (error) throw error;

      return room;
    } catch (error: any) {
      throw new Error(`Failed to update room: ${error.message}`);
    }
  }

  /**
   * Check room availability for a date range
   */
  static async checkAvailability(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date
  ) {
    try {
      const { data: conflicts, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .eq("status", "Confirmed")
        .lt("check_in_date", checkOutDate.toISOString())
        .gt("check_out_date", checkInDate.toISOString());

      if (error) throw error;

      return {
        available: !conflicts || conflicts.length === 0,
        conflicts: conflicts || [],
      };
    } catch (error: any) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }

  /**
   * Get room recommendation based on user preferences
   */
  static async getRecommendations(
    budget: number,
    roomType?: string,
    amenities?: string[]
  ) {
    try {
      let query = supabase
        .from("rooms")
        .select("*")
        .lte("base_price", budget)
        .eq("is_available", true);

      if (roomType) query = query.eq("type", roomType);

      const { data: rooms, error } = await query
        .order("rating", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Filter by amenities if provided
      if (amenities && amenities.length > 0) {
        return rooms?.filter((room) =>
          amenities.every((amenity) => room.amenities.includes(amenity))
        );
      }

      return rooms || [];
    } catch (error: any) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }
}
