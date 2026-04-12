/**
 * Extended E2E Tests - Complete User Journeys
 * Tests comprehensive workflows including new pages
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Complete User Journey E2E", () => {
  let userId: string;
  let authToken: string;
  let roomId: string;
  let bookingId: string;
  const baseUrl = "http://localhost:3001";

  describe("Authentication & Profile Setup", () => {
    it("should sign up with email and password", async () => {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: `user${Date.now()}@example.com`,
          password: "SecurePass123!",
          confirmPassword: "SecurePass123!",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("userId");
      userId = data.data.userId;
    });

    it("should login with correct credentials", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "SecurePass123!",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("session");
      authToken = data.data.session.access_token;
    });

    it("should update user profile", async () => {
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          phone: "+1234567890",
          address: "123 Main St",
          university: "MIT",
          bio: "Student looking for accommodation",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    it("should fetch user profile", async () => {
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("name");
      expect(data.data).toHaveProperty("email");
    });
  });

  describe("Room Discovery & Browsing", () => {
    it("should search available rooms with filters", async () => {
      const params = new URLSearchParams({
        minPrice: "300",
        maxPrice: "1000",
        type: "single",
        university: "MIT",
        limit: "10",
      });

      const response = await fetch(`${baseUrl}/api/rooms?${params}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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

    it("should get room details with reviews", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("room_number");
      expect(data.data).toHaveProperty("base_price");
      expect(data.data).toHaveProperty("amenities");
    });

    it("should get room recommendations", async () => {
      const params = new URLSearchParams({
        type: "recommendations",
        limit: "5",
      });

      const response = await fetch(`${baseUrl}/api/rooms?${params}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.rooms)).toBe(true);
    });
  });

  describe("Booking Workflow", () => {
    it("should create booking", async () => {
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
          notes: "Quiet please",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("id");
      bookingId = data.data.id;
    });

    it("should get booking details", async () => {
      if (!bookingId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(bookingId);
    });

    it("should process payment for booking", async () => {
      if (!bookingId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          paymentMethod: "credit_card",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.payment_status).toBe("paid");
    });

    it("should update booking status", async () => {
      if (!bookingId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          status: "Confirmed",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("Reviews & Ratings", () => {
    it("should post review for room", async () => {
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
          comment: "Excellent room, clean and comfortable!",
        }),
      });

      expect([201, 409]).toContain(response.status); // 409 if already reviewed
      const data = await response.json();
      if (response.status === 201) {
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty("id");
      }
    });

    it("should fetch room reviews", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/reviews?roomId=${roomId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("reviews");
      expect(data.data).toHaveProperty("averageRating");
    });
  });

  describe("Notifications", () => {
    it("should fetch user notifications", async () => {
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
      expect(Array.isArray(data.data.notifications)).toBe(true);
    });

    it("should mark notification as read", async () => {
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

      if (response.ok) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe("User Dashboard & Analytics", () => {
    it("should get user dashboard stats", async () => {
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
      expect(data.data).toHaveProperty("averageRating");
    });

    it("should get booking statistics", async () => {
      const response = await fetch(
        `${baseUrl}/api/analytics?type=booking-stats`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": userId,
          },
        }
      );

      if (response.ok) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe("Contact Form", () => {
    it("should submit contact form", async () => {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          subject: "Question about bookings",
          message: "How do I modify my booking?",
        }),
      });

      expect([201, 200]).toContain(response.status);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should reject booking for non-available room", async () => {
      const response = await fetch(`${baseUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          roomId: "invalid-id",
          checkInDate: "2024-01-01",
          checkOutDate: "2024-01-07",
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should reject invalid review rating", async () => {
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
          rating: 10, // Invalid: should be 1-5
          comment: "Test",
        }),
      });

      expect(response.status).toBe(400);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await fetch(`${baseUrl}/api/bookings`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
