/**
 * Reviews API Route
 * Handles room review creation and retrieval
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ReviewService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/reviews
 * Get reviews with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      roomId: searchParams.get("roomId") || undefined,
      userId: searchParams.get("userId") || undefined,
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const result = await ReviewService.getReviewsByFilter(filters);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/reviews");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * POST /api/reviews
 * Create a new review
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

    const result = await ReviewService.createReview(body, userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error, "POST /api/reviews");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
