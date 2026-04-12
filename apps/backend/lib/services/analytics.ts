/**
 * Analytics Service - Handles booking statistics, insights, and reporting
 * Implements: Dashboard metrics, revenue tracking, booking trends
 */

import { createClient } from "@supabase/supabase-js";
import { AnalyticsFilterSchema } from "@unilodge/shared/schemas";
import type { AnalyticsFilter } from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AnalyticsService {
  /**
   * Get dashboard statistics for warden
   */
  static async getWardenDashboard(wardenId: string) {
    try {
      // Get warden's rooms
      const { data: rooms } = await supabase
        .from("rooms")
        .select("id")
        .eq("warden_id", wardenId);

      const roomIds = rooms?.map((r) => r.id) || [];

      if (roomIds.length === 0) {
        return {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
          upcomingBookings: 0,
        };
      }

      // Get booking stats
      const { data: bookingStats } = await supabase
        .from("bookings")
        .select("status, payment_status, total_price")
        .in("room_id", roomIds);

      const confirmed =
        bookingStats?.filter((b) => b.status === "Confirmed").length || 0;
      const pending =
        bookingStats?.filter((b) => b.status === "Pending").length || 0;
      const cancelled =
        bookingStats?.filter((b) => b.status === "Cancelled").length || 0;
      const totalRevenue =
        bookingStats
          ?.filter((b) => b.payment_status === "paid")
          .reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      // Get upcoming bookings
      const now = new Date().toISOString().split("T")[0];
      const { count: upcomingCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .in("room_id", roomIds)
        .eq("status", "Confirmed")
        .gt("check_in_date", now);

      return {
        totalBookings: bookingStats?.length || 0,
        confirmedBookings: confirmed,
        pendingBookings: pending,
        cancelledBookings: cancelled,
        totalRevenue,
        upcomingBookings: upcomingCount || 0,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch dashboard: ${error.message}`);
    }
  }

  /**
   * Get booking statistics for a date range
   */
  static async getBookingStatistics(filters?: Partial<AnalyticsFilter>) {
    const parsed = filters ? AnalyticsFilterSchema.parse(filters) : {};

    try {
      let query = supabase
        .from("booking_statistics")
        .select("*");

      if (parsed.startDate) {
        const startStr = parsed.startDate.toISOString().split("T")[0];
        query = query.gte("booking_date", startStr);
      }

      if (parsed.endDate) {
        const endStr = parsed.endDate.toISOString().split("T")[0];
        query = query.lte("booking_date", endStr);
      }

      const { data: stats, error } = await query.order("booking_date", {
        ascending: false,
      });

      if (error) throw error;

      // Calculate aggregates
      const totalBookings =
        stats?.reduce((sum, s) => sum + (s.total_bookings || 0), 0) || 0;
      const confirmedBookings =
        stats?.reduce((sum, s) => sum + (s.confirmed_bookings || 0), 0) || 0;
      const totalRevenue =
        stats?.reduce((sum, s) => sum + (s.total_revenue || 0), 0) || 0;

      return {
        stats: stats || [],
        aggregates: {
          totalBookings,
          confirmedBookings,
          totalRevenue,
          averageRevenue:
            stats && stats.length > 0 ? totalRevenue / stats.length : 0,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch booking statistics: ${error.message}`);
    }
  }

  /**
   * Get room popularity metrics
   */
  static async getRoomPopularity() {
    try {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select(
          "id, room_number, base_price, (SELECT COUNT(*) FROM bookings WHERE room_id = rooms.id AND status = 'Confirmed') as booking_count, (SELECT AVG(rating) FROM reviews WHERE room_id = rooms.id AND deleted_at IS NULL) as avg_rating"
        )
        .order("booking_count", { ascending: false })
        .limit(10);

      if (error) throw error;

      return rooms || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch room popularity: ${error.message}`);
    }
  }

  /**
   * Get revenue trends over time
   */
  static async getRevenueTrends(months: number = 12) {
    try {
      const { data: trends, error } = await supabase
        .from("booking_statistics")
        .select("booking_date, total_revenue")
        .order("booking_date", { ascending: true });

      if (error) throw error;

      // Group by month if data exists
      const groupedTrends = new Map<string, number>();

      trends?.forEach((t) => {
        const date = new Date(t.booking_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const current = groupedTrends.get(monthKey) || 0;
        groupedTrends.set(monthKey, current + (t.total_revenue || 0));
      });

      return Array.from(groupedTrends.entries())
        .map(([month, revenue]) => ({
          month,
          revenue,
        }))
        .slice(-months);
    } catch (error: any) {
      throw new Error(`Failed to fetch revenue trends: ${error.message}`);
    }
  }

  /**
   * Get occupancy rates
   */
  static async getOccupancyRates(filters?: Partial<AnalyticsFilter>) {
    const parsed = filters ? AnalyticsFilterSchema.parse(filters) : {};

    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("room_id, check_in_date, check_out_date, status")
        .eq("status", "Confirmed");

      if (!bookings || bookings.length === 0) {
        return [];
      }

      // Calculate occupancy by room
      const occupancyMap = new Map<string, { occupied: number; total: number }>();

      bookings.forEach((b) => {
        const current = occupancyMap.get(b.room_id) || {
          occupied: 0,
          total: 0,
        };
        const inDate = new Date(b.check_in_date);
        const outDate = new Date(b.check_out_date);
        const days =
          (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24);

        occupancyMap.set(b.room_id, {
          occupied: current.occupied + days,
          total: current.total + 365, // Assuming 365 days in a year
        });
      });

      return Array.from(occupancyMap.entries()).map(([roomId, data]) => ({
        roomId,
        occupancyRate: (data.occupied / data.total) * 100,
      }));
    } catch (error: any) {
      throw new Error(`Failed to calculate occupancy rates: ${error.message}`);
    }
  }

  /**
   * Get user booking statistics
   */
  static async getUserBookingStats(userId: string) {
    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("status, payment_status, total_price");

      const userBookings =
        bookings?.filter((b) => b.user_id === userId) || [];

      const completed = userBookings.filter(
        (b) => b.status === "Confirmed" && b.payment_status === "paid"
      ).length;
      const pending = userBookings.filter(
        (b) => b.status === "Pending"
      ).length;
      const cancelled = userBookings.filter(
        (b) => b.status === "Cancelled"
      ).length;
      const totalSpent = userBookings.reduce(
        (sum, b) => sum + (b.total_price || 0),
        0
      );

      return {
        totalBookings: userBookings.length,
        completedBookings: completed,
        pendingBookings: pending,
        cancelledBookings: cancelled,
        totalSpent,
        averageSpent:
          userBookings.length > 0 ? totalSpent / userBookings.length : 0,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch user booking stats: ${error.message}`
      );
    }
  }

  /**
   * Get payment method distribution
   */
  static async getPaymentDistribution() {
    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("payment_status, total_price");

      const distribution = {
        paid: 0,
        pending: 0,
        failed: 0,
      };

      const revenue = {
        paid: 0,
        pending: 0,
        failed: 0,
      };

      bookings?.forEach((b) => {
        distribution[b.payment_status as keyof typeof distribution]++;
        revenue[b.payment_status as keyof typeof revenue] +=
          b.total_price || 0;
      });

      return {
        distribution,
        revenue,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch payment distribution: ${error.message}`
      );
    }
  }

  /**
   * Get peak booking periods
   */
  static async getPeakBookingPeriods() {
    try {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("check_in_date, status")
        .eq("status", "Confirmed");

      const monthCounts = new Map<string, number>();

      bookings?.forEach((b) => {
        const date = new Date(b.check_in_date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      });

      return Array.from(monthCounts.entries())
        .map(([month, count]) => ({
          month,
          bookings: count,
        }))
        .sort((a, b) => b.bookings - a.bookings);
    } catch (error: any) {
      throw new Error(`Failed to fetch peak periods: ${error.message}`);
    }
  }
}
