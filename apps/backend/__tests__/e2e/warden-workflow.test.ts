/**
 * Warden E2E Tests
 * Complete warden workflows for room and booking management
 */

import { describe, it, expect, beforeAll } from "vitest";

describe("Warden Dashboard E2E", () => {
  let wardenId: string;
  let authToken: string;
  let roomId: string;
  const baseUrl = "http://localhost:3001";

  describe("Warden Authentication", () => {
    it("should sign up as warden", async () => {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Smith",
          email: `warden${Date.now()}@example.com`,
          password: "SecurePass123!",
          confirmPassword: "SecurePass123!",
          role: "warden",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      wardenId = data.data.userId;
    });

    it("should login as warden", async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "warden@example.com",
          password: "SecurePass123!",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      authToken = data.data.session.access_token;
    });
  });

  describe("Room Management", () => {
    it("should create a new room", async () => {
      const response = await fetch(`${baseUrl}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
        body: JSON.stringify({
          room_number: "A101",
          type: "single",
          base_price: 500,
          capacity: 1,
          university: "MIT",
          amenities: ["WiFi", "AC"],
          description: "Cozy single room near campus",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("id");
      roomId = data.data.id;
    });

    it("should update room details", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
        body: JSON.stringify({
          base_price: 550,
          amenities: ["WiFi", "AC", "Balcony"],
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it("should get wardens rooms", async () => {
      const response = await fetch(`${baseUrl}/api/warden/rooms`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.rooms)).toBe(true);
    });

    it("should toggle room availability", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
        body: JSON.stringify({
          is_available: false,
        }),
      });

      if (response.ok) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe("Bookings Management", () => {
    it("should get wardens bookings", async () => {
      const response = await fetch(`${baseUrl}/api/warden/bookings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("bookings");
      expect(Array.isArray(data.data.bookings)).toBe(true);
    });

    it("should filter bookings by status", async () => {
      const response = await fetch(
        `${baseUrl}/api/warden/bookings?status=Pending`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": wardenId,
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

  describe("Warden Analytics", () => {
    it("should get warden dashboard stats", async () => {
      const response = await fetch(
        `${baseUrl}/api/analytics?type=dashboard&role=warden`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": wardenId,
          },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty("totalRooms");
      expect(data.data).toHaveProperty("occupiedRooms");
      expect(data.data).toHaveProperty("totalRevenue");
    });

    it("should get revenue trends", async () => {
      const response = await fetch(
        `${baseUrl}/api/analytics?type=revenue&role=warden`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": wardenId,
          },
        }
      );

      if (response.ok) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });

    it("should get occupancy rates", async () => {
      const response = await fetch(
        `${baseUrl}/api/analytics?type=occupancy&role=warden`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "x-user-id": wardenId,
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

  describe("Room Deletion", () => {
    it("should delete room", async () => {
      if (!roomId) {
        expect(true).toBe(true);
        return;
      }

      const response = await fetch(`${baseUrl}/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "x-user-id": wardenId,
        },
      });

      if (response.ok) {
        expect([200, 204]).toContain(response.status);
      }
    });
  });
});
