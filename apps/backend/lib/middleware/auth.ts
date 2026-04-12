/**
 * Authentication Middleware
 * Handles user authentication and session validation
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Protected route middleware
 * Validates JWT token and adds user info to headers
 */
export async function withAuth(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: { message: "Missing authorization token" } },
        { status: 401 }
      );
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json(
        { error: { message: "Invalid token" } },
        { status: 401 }
      );
    }

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", data.user.id);
    requestHeaders.set("x-user-email", data.user.email || "");

    // Get user role from profiles table
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile) {
      requestHeaders.set("x-user-role", profile.role);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Authentication failed" } },
      { status: 401 }
    );
  }
}

/**
 * Extract user from request headers
 */
export function getUserFromRequest(request: NextRequest) {
  return {
    id: request.headers.get("x-user-id"),
    email: request.headers.get("x-user-email"),
    role: request.headers.get("x-user-role"),
  };
}

/**
 * Check if user has required role
 */
export function requireRole(allowedRoles: string[]) {
  return (request: NextRequest) => {
    const user = getUserFromRequest(request);

    if (!user.id) {
      return NextResponse.json(
        { error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.role || "")) {
      return NextResponse.json(
        { error: { message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    return NextResponse.next();
  };
}
