/**
 * Booking Service - Handles booking creation, management, and payment
 * Implements: Booking validation, conflict checking, payment processing
 */

import { createClient } from "@supabase/supabase-js";
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  UpdatePaymentStatusSchema,
} from "@unilodge/shared/schemas";
import type {
  CreateBookingInput,
  UpdateBookingStatusInput,
  UpdatePaymentStatusInput,
} from "@unilodge/shared/schemas";
import { RoomService } from "./rooms";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class BookingService {
  /**
   * Create a new booking with conflict checking
   */
  static async createBooking(input: CreateBookingInput, userId: string) {
    const parsed = CreateBookingSchema.parse(input);

    try {
      const checkInDate = new Date(parsed.checkInDate);
      const checkOutDate = new Date(parsed.checkOutDate);

      // Check room availability
      const availability = await RoomService.checkAvailability(
        parsed.roomId,
        checkInDate,
        checkOutDate
      );

      if (!availability.available) {
        throw new Error(
          "Room is not available for the selected dates"
        );
      }

      // Calculate price
      const days =
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);
      const { data: room } = await supabase
        .from("rooms")
        .select("base_price")
        .eq("id", parsed.roomId)
        .single();

      const totalPrice = (room?.base_price || 0) * days;

      // Create booking
      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          room_id: parsed.roomId,
          user_id: userId,
          check_in_date: checkInDate.toISOString().split("T")[0],
          check_out_date: checkOutDate.toISOString().split("T")[0],
          status: "Pending",
          payment_status: "pending",
          total_price: totalPrice,
          notes: parsed.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for warden
      await this.notifyWarden(parsed.roomId, `New booking request for room`, booking.id);

      return booking;
    } catch (error: any) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Get bookings for a user with filtering
   */
  static async getUserBookings(
    userId: string,
    status?: string,
    paymentStatus?: string
  ) {
    try {
      let query = supabase
        .from("bookings")
        .select("*, room_id(*)")
        .eq("user_id", userId);

      if (status) query = query.eq("status", status);
      if (paymentStatus) query = query.eq("payment_status", paymentStatus);

      const { data: bookings, error } = await query.order("check_in_date", {
        ascending: false,
      });

      if (error) throw error;

      return bookings || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  /**
   * Update booking status (cancel, confirm, etc.)
   */
  static async updateBookingStatus(
    bookingId: string,
    input: UpdateBookingStatusInput,
    userId: string
  ) {
    const parsed = UpdateBookingStatusSchema.parse(input);

    try {
      // Get booking first
      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (!booking) throw new Error("Booking not found");

      // Verify user owns booking or is admin
      if (booking.user_id !== userId) {
        // TODO: Check if user is admin
        throw new Error("Unauthorized");
      }

      // Update status
      const { data: updated, error } = await supabase
        .from("bookings")
        .update({
          status: parsed.status,
          updated_at: new Date(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      // Create notification
      const message =
        parsed.status === "Confirmed"
          ? "Your booking has been confirmed!"
          : parsed.status === "Cancelled"
          ? "Your booking has been cancelled"
          : "Your booking status has been updated";

      await this.createNotification(booking.user_id, message, "booking_update");

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  /**
   * Process payment for booking
   */
  static async processPayment(
    bookingId: string,
    paymentMethod: string,
    userId: string
  ) {
    try {
      // Get booking
      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .eq("user_id", userId)
        .single();

      if (!booking) throw new Error("Booking not found");
      if (booking.payment_status === "paid") throw new Error("Already paid");

      // TODO: Integrate with payment provider (Stripe, PayPal, etc.)
      // For now, simulate successful payment

      // Update payment status
      const { data: updated, error } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          updated_at: new Date(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;

      return updated;
    } catch (error: any) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Get booking recommendations based on user search history
   */
  static async getPersonalizedRecommendations(userId: string) {
    try {
      // Get user's previous bookings
      const { data: userBookings } = await supabase
        .from("bookings")
        .select("room_id")
        .eq("user_id", userId)
        .limit(5);

      if (!userBookings || userBookings.length === 0) {
        // Return popular rooms if no history
        return await supabase
          .from("rooms")
          .select("*")
          .eq("is_available", true)
          .order("rating", { ascending: false })
          .limit(10);
      }

      // Get similar rooms based on type and amenities
      const roomIds = userBookings.map((b) => b.room_id);
      const { data: relatedRooms } = await supabase
        .from("rooms")
        .select("*")
        .in("id", roomIds)
        .limit(10);

      return relatedRooms || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get recommendations: ${error.message}`
      );
    }
  }

  /**
   * Create notification helper
   */
  private static async createNotification(
    userId: string,
    message: string,
    type: string
  ) {
    try {
      await supabase.from("notifications").insert({
        user_id: userId,
        message,
        type,
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  /**
   * Notify warden of new booking
   */
  private static async notifyWarden(roomId: string, message: string, bookingId: string) {
    try {
      const { data: room } = await supabase
        .from("rooms")
        .select("warden_id")
        .eq("id", roomId)
        .single();

      if (room?.warden_id) {
        await this.createNotification(room.warden_id, `${message} #${bookingId.slice(0, 8)}`, "booking_request");
      }
    } catch (error) {
      console.error("Failed to notify warden:", error);
    }
  }
}
