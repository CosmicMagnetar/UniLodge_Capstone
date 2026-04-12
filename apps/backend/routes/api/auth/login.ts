/**
 * Login API Route
 * Handles user login endpoint
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * POST /api/auth/login
 * Login user and return session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await AuthService.login(body);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logError(error, "POST /api/auth/login");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 401 });
  }
}
