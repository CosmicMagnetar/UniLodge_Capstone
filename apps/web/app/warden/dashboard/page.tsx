/**
 * Warden Dashboard
 * Manage rooms, view bookings, and analytics for room wardens
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Home,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Loader,
  ChevronRight,
} from "lucide-react";

interface WardenStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageOccupancy: number;
  totalBookings: number;
}

export default function WardenDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<WardenStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");
    const userRole = localStorage.getItem("user_role");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    if (userRole !== "warden") {
      router.push("/dashboard");
      return;
    }

    fetchWardenData(token, userId);
  }, []);

  async function fetchWardenData(token: string, userId: string) {
    try {
      const statsRes = await fetch(
        "/api/analytics?type=dashboard&role=warden",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          },
        },
      );

      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch warden data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.clear();
    router.push("/");
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
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Warden Dashboard</h1>
            <p className="text-blue-100">Manage your accommodations</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Key Metrics */}
        {stats && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Rooms</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalRooms}
                    </p>
                  </div>
                  <Home className="text-blue-600" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Occupied</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.occupiedRooms}
                    </p>
                  </div>
                  <Users className="text-green-600" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Available</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.availableRooms}
                    </p>
                  </div>
                  <Calendar className="text-orange-600" size={40} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.averageOccupancy}%
                    </p>
                  </div>
                  <TrendingUp className="text-purple-600" size={40} />
                </div>
              </div>
            </div>

            {/* Revenue Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="text-green-600" />
                    Total Revenue
                  </h3>
                </div>
                <p className="text-4xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  All-time revenue from bookings
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    Monthly Revenue
                  </h3>
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Current month revenue
                </p>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/warden/rooms"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage Rooms</h3>
              <Home className="text-blue-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Add, edit, or remove accommodations
            </p>
            <div className="flex items-center text-blue-600 font-semibold text-sm">
              Go to Rooms <ChevronRight size={16} />
            </div>
          </Link>

          <Link
            href="/warden/bookings"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">View Bookings</h3>
              <Calendar className="text-green-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Check incoming and confirmed bookings
            </p>
            <div className="flex items-center text-green-600 font-semibold text-sm">
              View Bookings <ChevronRight size={16} />
            </div>
          </Link>

          <Link
            href="/warden/analytics"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Analytics</h3>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View detailed insights and reports
            </p>
            <div className="flex items-center text-purple-600 font-semibold text-sm">
              View Analytics <ChevronRight size={16} />
            </div>
          </Link>
        </div>

        {/* Settings & Support */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/warden/settings"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-lg transition flex items-center gap-4"
          >
            <Settings className="text-gray-600" size={32} />
            <div>
              <h3 className="font-semibold text-gray-900">Account Settings</h3>
              <p className="text-gray-600 text-sm">
                Manage account preferences
              </p>
            </div>
            <ChevronRight className="ml-auto text-gray-400" />
          </Link>

          <Link
            href="/support"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-lg transition flex items-center gap-4"
          >
            <span className="text-3xl">💬</span>
            <div>
              <h3 className="font-semibold text-gray-900">Get Support</h3>
              <p className="text-gray-600 text-sm">Contact our support team</p>
            </div>
            <ChevronRight className="ml-auto text-gray-400" />
          </Link>
        </div>
      </div>
    </main>
  );
}
