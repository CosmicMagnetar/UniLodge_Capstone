/**
 * Booking Details API Route
 * Handles single booking operations
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BookingService, NotificationService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/bookings/[bookingId]
 * Get a single booking
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const userId = request.headers.get("x-user-id") || "";

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const bookings = await BookingService.getUserBookings(userId);
    const booking = bookings.find((b) => b.id === bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: { message: "Booking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/bookings/[bookingId]");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * PUT /api/bookings/[bookingId]
 * Update booking status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "";

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const result = await BookingService.updateBookingStatus(
      bookingId,
      body,
      userId
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "PUT /api/bookings/[bookingId]");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * POST /api/bookings/[bookingId]/pay
 * Process payment for booking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "";

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const result = await BookingService.processPayment(
      bookingId,
      body.paymentMethod,
      userId
    );

    // Send payment success notification
    await NotificationService.notifyPaymentSuccess(
      userId,
      bookingId,
      result.total_price || 0
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "POST /api/bookings/[bookingId]/pay");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
