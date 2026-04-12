/**
 * Warden Bookings Page
 * View and manage all bookings for warden's rooms
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  Check,
  Clock,
  X,
  FileText,
  Loader,
} from "lucide-react";
import { SelectField } from "@/components/forms/FormComponents";

interface BookingRecord {
  id: string;
  roomId: string;
  room_number: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  payment_status: string;
  totalPrice: number;
  nights: number;
}

export default function WardenBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchBookings(token, userId);
  }, []);

  async function fetchBookings(token: string, userId: string) {
    try {
      const response = await fetch("/api/warden/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });

      const data = await response.json();

      if (data.success && data.data.bookings) {
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setBookings((b) =>
          b.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  }

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status.toLowerCase() === filter);

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
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/warden/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4 overflow-x-auto">
          {(["all", "pending", "confirmed", "cancelled"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {filteredBookings.length})
              </button>
            ),
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredBookings.length > 0 ? (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
              >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Left Column */}
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm mb-1">Room</p>
                      <p className="text-2xl font-bold text-gray-900">
                        #{booking.room_number}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-600 text-sm mb-1">Guest</p>
                      <p className="font-semibold text-gray-900">
                        {booking.guestName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.guestEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Duration</p>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {booking.nights} night
                          {booking.nights > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm mb-1">Check In</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-600 text-sm mb-1">Check Out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${booking.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="grid md:grid-cols-2 gap-6 py-4 border-t border-b">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Booking Status</p>
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        updateBookingStatus(booking.id, e.target.value)
                      }
                      className={`px-4 py-2 rounded-lg font-semibold border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        booking.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-2">Payment Status</p>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                        booking.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.payment_status === "paid" ? (
                        <Check size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                      {booking.payment_status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold transition"
                  >
                    <FileText size={18} />
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      const message = `Hello ${booking.guestName},\n\nThis is regarding your booking of room ${booking.room_number}.\n\nCheck-in: ${new Date(booking.checkInDate).toLocaleDateString()}\nCheck-out: ${new Date(booking.checkOutDate).toLocaleDateString()}\n\nPlease let me know if you have any questions.`;
                      window.location.href = `mailto:${booking.guestEmail}?subject=Booking Confirmation - Room ${booking.room_number}&body=${encodeURIComponent(message)}`;
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition"
                  >
                    💬 Contact Guest
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Calendar className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-gray-600 text-lg mb-2">No bookings yet</p>
            <p className="text-gray-500 text-sm">
              {filter === "all"
                ? "When guests book your rooms, they'll appear here."
                : `No ${filter} bookings at the moment.`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
