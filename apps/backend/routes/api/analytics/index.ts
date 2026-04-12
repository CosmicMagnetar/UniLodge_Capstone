/**
 * Analytics API Route
 * Handles dashboard statistics and reporting
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AnalyticsService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/analytics/dashboard
 * Get warden dashboard statistics
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

    const type = searchParams.get("type") || "dashboard";

    let result;

    switch (type) {
      case "dashboard":
        result = await AnalyticsService.getWardenDashboard(userId);
        break;
      case "statistics":
        result = await AnalyticsService.getBookingStatistics();
        break;
      case "popularity":
        result = await AnalyticsService.getRoomPopularity();
        break;
      case "revenue":
        result = await AnalyticsService.getRevenueTrends();
        break;
      case "occupancy":
        result = await AnalyticsService.getOccupancyRates();
        break;
      case "user-stats":
        result = await AnalyticsService.getUserBookingStats(userId);
        break;
      case "payment-distribution":
        result = await AnalyticsService.getPaymentDistribution();
        break;
      case "peak-periods":
        result = await AnalyticsService.getPeakBookingPeriods();
        break;
      default:
        return NextResponse.json(
          { error: { message: "Invalid analytics type" } },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/analytics");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
