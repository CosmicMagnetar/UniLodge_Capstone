/**
 * Notifications API Route
 * Handles user notifications
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { NotificationService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/notifications
 * Get user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const searchParams = request.nextUrl.searchParams;

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 20;
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 0;

    const result = await NotificationService.getUserNotifications(
      userId,
      unreadOnly,
      limit,
      offset
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/notifications");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    if (body.markAll) {
      // Mark all as read
      const result = await NotificationService.markAllAsRead(userId);
      return NextResponse.json({ success: true, data: result });
    } else if (body.notificationIds && Array.isArray(body.notificationIds)) {
      // Mark multiple as read
      const result = await NotificationService.markMultipleAsRead(
        body.notificationIds,
        userId
      );
      return NextResponse.json({ success: true, data: result });
    } else {
      return NextResponse.json(
        { error: { message: "Invalid request" } },
        { status: 400 }
      );
    }
  } catch (error: any) {
    logError(error, "PATCH /api/notifications");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const searchParams = request.nextUrl.searchParams;

    if (!userId) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    if (searchParams.get("all") === "true") {
      // Delete all notifications
      const result = await NotificationService.deleteAllNotifications(userId);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { error: { message: "Invalid request" } },
      { status: 400 }
    );
  } catch (error: any) {
    logError(error, "DELETE /api/notifications");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
