import { z } from "zod";

/**
 * Room types and schemas for validation
 */

export const RoomTypeEnum = z.enum(["Single", "Double", "Suite", "Studio"]);
export const RoomStatusEnum = z.enum(["pending", "approved", "rejected"]);

export const RoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: RoomTypeEnum,
  basePrice: z.number().positive("Price must be positive"),
  amenities: z.array(z.string()).default([]),
  description: z.string().optional(),
  capacity: z.number().int().min(1, "Capacity must be at least 1"),
  university: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  rating: z.number().min(0).max(5).default(0),
});

export const CreateRoomSchema = RoomSchema.extend({
  imageUrl: z.string().url("Invalid image URL"),
});

export const UpdateRoomSchema = RoomSchema.partial();

export const RoomFilterSchema = z.object({
  type: RoomTypeEnum.optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  available: z.boolean().optional(),
  university: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Type exports
export type RoomType = z.infer<typeof RoomTypeEnum>;
export type RoomStatus = z.infer<typeof RoomStatusEnum>;
export type Room = z.infer<typeof RoomSchema>;
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
export type RoomFilterInput = z.infer<typeof RoomFilterSchema>;
