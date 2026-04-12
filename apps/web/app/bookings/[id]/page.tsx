/**
 * Booking Details Page
 * View full booking information, payment status, and actions
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Loader,
} from "lucide-react";

interface BookingDetail {
  id: string;
  roomId: string;
  room_number: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  payment_status: string;
  notes?: string;
  roomDetails?: {
    base_price: number;
    type: string;
    capacity: number;
    amenities: string[];
    university: string;
  };
  wardenContact?: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchBookingDetails(token, userId);
  }, []);

  async function fetchBookingDetails(token: string, userId: string) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });

      const data = await response.json();

      if (!data.success) {
        setError("Booking not found");
        return;
      }

      setBooking(data.data);
    } catch (err) {
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    if (!booking) return;

    setPaymentLoading(true);
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({ paymentMethod: "credit_card" }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.error || "Payment failed");
      }
    } catch (err) {
      setError("Payment processing failed");
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <XCircle className="mx-auto text-red-600 mb-4" size={40} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nights = Math.ceil(
    (new Date(booking.checkOutDate).getTime() -
      new Date(booking.checkInDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Booking Status</p>
              <h2 className="text-2xl font-bold text-gray-900">
                Room {booking.room_number}
              </h2>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  booking.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.status === "Confirmed" && <CheckCircle size={20} />}
                {booking.status === "Pending" && <Clock size={20} />}
                {booking.status}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Payment Status</p>
            <div className="flex items-center gap-2">
              {booking.payment_status === "paid" ? (
                <>
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="font-semibold text-green-600">Paid</span>
                </>
              ) : (
                <>
                  <Clock className="text-yellow-600" size={20} />
                  <span className="font-semibold text-yellow-600">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Check-in & Check-out */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar size={24} className="text-blue-600" />
              Stay Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Check In</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.checkInDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Check Out</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-gray-600 text-sm mb-1">Total Nights</p>
                <p className="text-lg font-semibold text-gray-900">
                  {nights} {nights === 1 ? "night" : "nights"}
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={24} className="text-green-600" />
              Price Details
            </h3>
            <div className="space-y-3">
              {booking.roomDetails && (
                <>
                  <div className="flex justify-between">
                    <p className="text-gray-600">
                      ${booking.roomDetails.base_price}/night × {nights} nights
                    </p>
                    <p className="font-semibold text-gray-900">
                      ${(booking.roomDetails.base_price * nights).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <p>Service Fee</p>
                    <p>${(booking.totalPrice * 0.05).toFixed(2)}</p>
                  </div>
                </>
              )}
              <div className="border-t pt-3 flex justify-between">
                <p className="font-semibold text-gray-900">Total Amount</p>
                <p className="text-xl font-bold text-blue-600">
                  ${booking.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        {booking.roomDetails && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Home size={24} className="text-indigo-600" />
              Room Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Room Type</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {booking.roomDetails.type}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Capacity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.roomDetails.capacity} person
                  {booking.roomDetails.capacity > 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">University</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.roomDetails.university}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {booking.roomDetails.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warden Contact */}
        {booking.wardenContact && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} className="text-purple-600" />
              Warden Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Name</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.wardenContact.name}
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                    <Phone size={16} /> Phone
                  </p>
                  <a
                    href={`tel:${booking.wardenContact.phone}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {booking.wardenContact.phone}
                  </a>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email
                  </p>
                  <a
                    href={`mailto:${booking.wardenContact.email}`}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    {booking.wardenContact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Special Notes */}
        {booking.notes && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
            <p className="text-gray-600">{booking.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex gap-4 flex-wrap">
            {booking.payment_status !== "paid" &&
              booking.status === "Pending" && (
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {paymentLoading && (
                    <Loader size={20} className="animate-spin" />
                  )}
                  {paymentLoading ? "Processing..." : "Pay Now"}
                </button>
              )}
            <Link
              href="/dashboard"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Back to Bookings
            </Link>
            <Link
              href={`/bookings/${booking.id}/review`}
              className="px-8 py-3 border border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50"
            >
              Leave Review
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
