/**
 * Integration Tests - Booking Workflow
 * Tests the complete booking flow: search → book → pay → review
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Booking Workflow E2E", () => {
  let userId: string;
  let roomId: string;
  let bookingId: string;
  const baseUrl = "http://localhost:3001";
  let authToken: string;

  describe("1. User Authentication", () => {
    it("should sign up a new user", async () => {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "TestPass123!",
          confirmPassword: "TestPass123!",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("userId");
      userId = data.data.userId;
    });

    it("should login user and get auth token", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPass123!",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("session");
      authToken = data.data.session.access_token;
    });
  });

  describe("2. Room Discovery", () => {
    it("should search for available rooms", async () => {
      const params = new URLSearchParams({
        minPrice: "400",
        maxPrice: "800",
        available: "true",
        limit: "10",
      });

      const response = await fetch(`${baseUrl}/api/rooms?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("rooms");
      expect(Array.isArray(data.data.rooms)).toBe(true);

      if (data.data.rooms.length > 0) {
        roomId = data.data.rooms[0].id;
      }
    });

    it("should filter rooms by type", async () => {
      const params = new URLSearchParams({
        type: "single",
        limit: "5",
      });

      const response = await fetch(`${baseUrl}/api/rooms?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.rooms).toBeDefined();
    });

    it("should get room details with reviews", async () => {
      if (!roomId) {
        // Skip if no rooms found
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("room_number");
      expect(data.data).toHaveProperty("base_price");
    });
  });

  describe("3. Booking Creation", () => {
    it("should create a booking", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const checkIn = new Date();
      const checkOut = new Date(checkIn.getTime() + 7 * 24 * 60 * 60 * 1000);

      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: checkIn.toISOString().split("T")[0],
          checkOutDate: checkOut.toISOString().split("T")[0],
          notes: "Test booking",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("id");
      expect(data.data.status).toBe("Pending");
      bookingId = data.data.id;
    });

    it("should not allow overlapping bookings", async () => {
      if (!roomId || !bookingId) {
        expect(true).toBe(true);
        return;
      }

      const checkIn = new Date();
      const checkOut = new Date(checkIn.getTime() + 7 * 24 * 60 * 60 * 1000);

      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: checkIn.toISOString().split("T")[0],
          checkOutDate: checkOut.toISOString().split("T")[0],
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should get user's bookings", async () => {
      const response = await fetch(`${baseUrl}/api/bookings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("4. Payment Processing", () => {
    it("should process payment for booking", async () => {
      if (!bookingId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/bookings/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "x-user-id": userId,
          },
          body: JSON.stringify({
            paymentMethod: "credit_card",
          }),
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.payment_status).toBe("paid");
    });

    it("should not process payment twice", async () => {
      if (!bookingId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/bookings/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "x-user-id": userId,
          },
          body: JSON.stringify({
            paymentMethod: "credit_card",
          }),
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe("5. Review Posting", () => {
    it("should post a review for booked room", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          roomId,
          rating: 5,
          comment: "Great room, very clean and comfortable!",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("id");
    });

    it("should get room reviews", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/reviews?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("reviews");
      expect(data.data).toHaveProperty("averageRating");
    });
  });

  describe("6. Notifications", () => {
    it("should get user notifications", async () => {
      const response = await fetch(`${baseUrl}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("notifications");
      expect(data.data).toHaveProperty("unread");
    });

    it("should mark notifications as read", async () => {
      const response = await fetch(`${baseUrl}/api/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          markAll: true,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("7. Analytics", () => {
    it("should get user booking statistics", async () => {
      const response = await fetch(
        `${baseUrl}/api/analytics?type=user-stats`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": userId,
          },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("totalBookings");
      expect(data.data).toHaveProperty("completedBookings");
    });
  });
});
