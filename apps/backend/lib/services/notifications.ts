/**
 * Notification Service - Handles user notifications and messaging
 * Implements: Creating, retrieving, updating, and deleting notifications
 */

import { createClient } from "@supabase/supabase-js";
import {
  CreateNotificationSchema,
  UpdateNotificationSchema,
  NotificationTypeEnum,
} from "@unilodge/shared/schemas";
import type {
  CreateNotificationInput,
  UpdateNotificationInput,
} from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification(
    userId: string,
    input: CreateNotificationInput
  ) {
    const parsed = CreateNotificationSchema.parse(input);

    try {
      const { data: notification, error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          message: parsed.message,
          type: parsed.type,
          related_id: parsed.relatedId,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Get notifications for a user with optional filtering
   */
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      if (unreadOnly) {
        query = query.eq("read", false);
      }

      const { data: notifications, count, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        notifications: notifications || [],
        total: count || 0,
        unread: unreadOnly
          ? count || 0
          : await this.getUnreadCount(userId),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }

  /**
   * Get count of unread notifications
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      return count || 0;
    } catch (error: any) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const { data: notification, error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      return notification;
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: string[], userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .in("id", notificationIds);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(
        `Failed to mark notifications as read: ${error.message}`
      );
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(userId: string) {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(
        `Failed to delete all notifications: ${error.message}`
      );
    }
  }

  /**
   * Send notification to warden when guest makes booking request
   */
  static async notifyWarden(
    wardenId: string,
    bookingId: string,
    guestName: string,
    roomNumber: string
  ) {
    try {
      await this.createNotification(wardenId, {
        message: `New booking request from ${guestName} for room ${roomNumber}`,
        type: "booking_request",
        relatedId: bookingId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to notify warden:", error);
      // Don't throw - notification failure shouldn't block booking creation
      return { success: false };
    }
  }

  /**
   * Send notification to guest when booking is confirmed
   */
  static async notifyBookingConfirmation(
    userId: string,
    bookingId: string,
    roomNumber: string
  ) {
    try {
      await this.createNotification(userId, {
        message: `Your booking for room ${roomNumber} has been confirmed!`,
        type: "booking_confirmation",
        relatedId: bookingId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to notify booking confirmation:", error);
      return { success: false };
    }
  }

  /**
   * Send notification when payment is successful
   */
  static async notifyPaymentSuccess(
    userId: string,
    bookingId: string,
    amount: number
  ) {
    try {
      await this.createNotification(userId, {
        message: `Payment of $${amount.toFixed(2)} has been received. Booking confirmed!`,
        type: "payment_success",
        relatedId: bookingId,
      });

      return { success: true };
    } catch (error: any) {
      console.error("Failed to notify payment success:", error);
      return { success: false };
    }
  }
}
