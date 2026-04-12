/**
 * Warden Analytics Page
 * Detailed analytics and insights for warden's business
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Loader,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  completedBookings: number;
  averageOccupancy: number;
  averageRating: number;
  topRoom: {
    room_number: string;
    bookings: number;
    revenue: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  occupancyTrend: {
    week: number;
    occupancy: number;
  }[];
}

export default function WardenAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">(
    "month",
  );

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchAnalytics(token, userId);
  }, [timeframe]);

  async function fetchAnalytics(token: string, userId: string) {
    try {
      const response = await fetch(
        `/api/analytics?type=dashboard&role=warden&timeframe=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/warden/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeframe === tf
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tf === "week"
                  ? "This Week"
                  : tf === "month"
                    ? "This Month"
                    : "This Year"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {analytics && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-semibold">
                    Total Revenue
                  </p>
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">↑ 12% from last period</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-semibold">
                    Monthly Revenue
                  </p>
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  ${analytics.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">Current period</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-semibold">
                    Total Bookings
                  </p>
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.totalBookings}
                </p>
                <p className="text-sm text-purple-600">
                  {analytics.completedBookings} completed
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm font-semibold">
                    Avg. Occupancy
                  </p>
                  <Users className="text-orange-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {analytics.averageOccupancy}%
                </p>
                <p className="text-sm text-orange-600">This {timeframe}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Revenue Trend */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Revenue Trend
                </h3>

                <div className="space-y-4">
                  {analytics.revenueByMonth.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {item.month}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          ${item.revenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.revenue / Math.max(...analytics.revenueByMonth.map((r) => r.revenue))) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Room */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="text-purple-600" />
                  Top Performing Room
                </h3>

                {analytics.topRoom && (
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Room</p>
                      <p className="text-2xl font-bold text-gray-900">
                        #{analytics.topRoom.room_number}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Bookings</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analytics.topRoom.bookings}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${analytics.topRoom.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                📊 Key Insights
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Customer Rating</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-yellow-600">
                      {analytics.averageRating.toFixed(1)}
                    </p>
                    <span>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(analytics.averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">
                    Booking Success Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.totalBookings > 0
                      ? Math.round(
                          (analytics.completedBookings /
                            analytics.totalBookings) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-2">Recommendation</p>
                  <p className="text-3xl font-bold text-green-600">Growing!</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
