/**
 * Booking Service Unit Tests
 */

import { describe, it, expect } from "vitest";
import { createBookingSchema } from "@unilodge/shared/schemas";

describe("BookingService", () => {
  describe("BookingSchema validation", () => {
    it("should accept valid booking input", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-07",
        notes: "Early check-in please",
      };

      expect(() => createBookingSchema.parse(input)).not.toThrow();
    });

    it("should require valid UUID for roomId", () => {
      const input = {
        roomId: "invalid-uuid",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-07",
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });

    it("should require checkInDate before checkOutDate", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-07",
        checkOutDate: "2024-06-01",
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });

    it("should allow same date as an error", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-01",
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });

    it("should accept optional notes", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-07",
      };

      const result = createBookingSchema.parse(input);
      expect(result.roomId).toBeDefined();
    });

    it("should validate notes max length", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-07",
        notes: "x".repeat(1001), // Too long
      };

      expect(() => createBookingSchema.parse(input)).toThrow();
    });
  });

  describe("date validation", () => {
    it("should parse ISO date strings", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: "2024-06-01",
        checkOutDate: "2024-06-07",
      };

      const result = createBookingSchema.parse(input);
      expect(result.checkInDate).toBeInstanceOf(Date);
      expect(result.checkOutDate).toBeInstanceOf(Date);
    });

    it("should handle Date objects", () => {
      const input = {
        roomId: "550e8400-e29b-41d4-a716-446655440000",
        checkInDate: new Date("2024-06-01"),
        checkOutDate: new Date("2024-06-07"),
      };

      expect(() => createBookingSchema.parse(input)).not.toThrow();
    });
  });
});
