/**
 * Rooms Listing API Route
 * Handles room listing and filtering
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RoomService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/rooms
 * Get rooms with filtering, search, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      type: searchParams.get("type") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      available: searchParams.get("available")
        ? searchParams.get("available") === "true"
        : undefined,
      university: searchParams.get("university") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const result = await RoomService.getRooms(filters);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/rooms");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * POST /api/rooms
 * Create a new room (admin/warden only)
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

    const result = await RoomService.createRoom(body, userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error, "POST /api/rooms");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
