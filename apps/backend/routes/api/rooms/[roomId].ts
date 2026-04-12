/**
 * Room Details API Route
 * Handles getting a single room with details and reviews
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { RoomService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/rooms/[roomId]
 * Get single room with details and reviews
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;

    const result = await RoomService.getRoom(roomId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/rooms/[roomId]");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 404 });
  }
}

/**
 * PUT /api/rooms/[roomId]
 * Update room details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;
    const body = await request.json();
    const userId = request.headers.get("x-user-id") || "";

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const result = await RoomService.updateRoom(roomId, body, userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "PUT /api/rooms/[roomId]");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
