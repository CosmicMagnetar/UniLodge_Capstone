/**
 * Auth Service - Handles authentication business logic
 * Implements: JWT generation, password validation, user management
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { LoginSchema, SignupSchema } from "@unilodge/shared/schemas";
import type { LoginInput, SignupInput } from "@unilodge/shared/schemas";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AuthService {
  /**
   * Register a new user in the system
   */
  static async signup(input: SignupInput) {
    // Validate input
    const parsed = SignupSchema.parse(input);

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: parsed.email,
        password: parsed.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create user profile in database
      const { data: profileData, error: profileError } =
        await supabase.from("user_profiles").insert({
          id: authData.user.id,
          full_name: parsed.name,
          role: "GUEST",
        });

      if (profileError) throw profileError;

      return {
        success: true,
        userId: authData.user.id,
        email: authData.user.email,
      };
    } catch (error: any) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  /**
   * Login user with email and password
   */
  static async login(input: LoginInput) {
    const parsed = LoginSchema.parse(input);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.email,
        password: parsed.password,
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile.full_name,
          role: profile.role,
        },
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Verify JWT token and get user
   */
  static async verifyToken(token: string) {
    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        id: data.user.id,
        email: data.user.email,
        name: profile.full_name,
        role: profile.role,
      };
    } catch (error: any) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Logout user by invalidating session
   */
  static async logout(token: string) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
}
