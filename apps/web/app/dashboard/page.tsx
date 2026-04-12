/**
 * User Dashboard
 * View bookings, profile, and account information
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Home,
  Calendar,
  Star,
  Bell,
  Settings,
  ChevronRight,
  Loader,
} from "lucide-react";

interface Booking {
  id: string;
  roomId: string;
  room_number: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
}

interface UserStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  averageRating: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    setAuthToken(token);
    fetchData(token, userId);
  }, []);

  async function fetchData(token: string, userId: string) {
    try {
      // Fetch bookings
      const bookingsRes = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.data || []);

      // Fetch stats
      const statsRes = await fetch("/api/analytics?type=user-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });
      const statsData = await statsRes.json();
      setStats(statsData.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
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
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                </div>
                <Calendar className="text-blue-600" size={40} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.completedBookings}
                  </p>
                </div>
                <Home className="text-green-600" size={40} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.upcomingBookings}
                  </p>
                </div>
                <Calendar className="text-orange-600" size={40} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Avg Rating</p>
                  <div className="flex items-center gap-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <Star className="text-yellow-600" fill="currentColor" />
                  </div>
                </div>
                <Star className="text-yellow-600" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Your Bookings</h2>
              <Link
                href="/rooms"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Book New Room
              </Link>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="divide-y">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Room {booking.room_number}
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-700">Check In</p>
                          <p>
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Check Out</p>
                          <p>
                            {new Date(
                              booking.checkOutDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Total</p>
                          <p>${booking.totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        View Details
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Home className="mx-auto text-gray-400 mb-4" size={40} />
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link
                href="/rooms"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Explore Rooms
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/profile"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <Settings className="text-blue-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" />
            </div>
          </Link>

          <Link
            href="/notifications"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <Bell className="text-yellow-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Check your updates</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" />
            </div>
          </Link>

          <Link
            href="/rooms"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <Home className="text-green-600" size={32} />
              <div>
                <h3 className="font-semibold text-gray-900">Find Rooms</h3>
                <p className="text-sm text-gray-600">Search available rooms</p>
              </div>
              <ChevronRight className="ml-auto text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
