/**
 * Bookings API Route
 * Handles booking creation and retrieval
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BookingService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/bookings
 * Get user's bookings with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const result = await BookingService.getUserBookings(
      userId,
      status || undefined,
      paymentStatus || undefined
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/bookings");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "";

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const result = await BookingService.createBooking(body, userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error, "POST /api/bookings");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
