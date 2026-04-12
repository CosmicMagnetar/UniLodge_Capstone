/**
 * Contact API Route
 * Handles contact form submissions
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ContactService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * GET /api/contact
 * Get all contact messages (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const isAdmin = request.headers.get("x-user-role") === "admin";

    if (!userId || !isAdmin) {
      return NextResponse.json(
        { error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit")
      ? Number(searchParams.get("limit"))
      : 20;

    const result = await ContactService.getAllContacts(status, page, limit);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "GET /api/contact");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}

/**
 * POST /api/contact
 * Create a new contact message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await ContactService.createContact(body);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: "Thank you for contacting us. We'll get back to you soon!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error, "POST /api/contact");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
