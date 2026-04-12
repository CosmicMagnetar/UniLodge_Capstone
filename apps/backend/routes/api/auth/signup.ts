/**
 * Auth API Routes
 * Handles user authentication endpoints
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services";
import { formatErrorResponse, logError } from "@/lib/utils";

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await AuthService.signup(body);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError(error, "POST /api/auth/signup");
    const formattedError = formatErrorResponse(error);

    return NextResponse.json(formattedError, { status: 400 });
  }
}
