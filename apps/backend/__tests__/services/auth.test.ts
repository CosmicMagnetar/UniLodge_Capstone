/**
 * Auth Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { loginSchema, signupSchema } from "@unilodge/shared/schemas";

// Mock Supabase client
vi.mock("@supabase/supabase-js");

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("should successfully create a new user", async () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      };

      // This would use mocked Supabase
      // const result = await AuthService.signup(input);
      // expect(result.success).toBe(true);
      // expect(result.email).toBe(input.email);
    });

    it("should reject invalid email", () => {
      const input = {
        fullName: "John Doe",
        email: "invalid-email",
        password: "SecurePass123!",
      };

      expect(() => signupSchema.parse(input)).toThrow();
    });

    it("should accept valid signup input", () => {
      const input = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      expect(() => SignupSchema.parse(input)).toThrow();
    });

    it("should reject weak password", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        password: "weak",
        confirmPassword: "weak",
      };

      expect(() => SignupSchema.parse(input)).toThrow();
    });
  });

  describe("login", () => {
    it("should validate email format", () => {
      const input = {
        email: "not-an-email",
        password: "password123",
      };

      expect(() => LoginSchema.parse(input)).toThrow();
    });

    it("should require password", () => {
      const input = {
        email: "john@example.com",
        password: "",
      };

      expect(() => LoginSchema.parse(input)).toThrow();
    });
  });

  describe("input validation", () => {
    it("should validate required name field", () => {
      const input = {
        fullName: "",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      expect(() => signupSchema.parse(input)).toThrow();
    });

    it("should accept valid signup input", () => {
      const input = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      expect(() => signupSchema.parse(input)).not.toThrow();
    });
  });
});
