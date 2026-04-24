/**
 * Room Validation Schemas — Zod
 * Whitelists fields to prevent mass-assignment attacks on updateRoom.
 */

import { z } from 'zod';

// ── Create Room ────────────────────────────────────────────────────────────

export const CreateRoomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .max(20, 'Room number must be 20 characters or fewer')
    .trim(),
  type: z.enum(['Single', 'Double', 'Suite', 'Studio']),
  price: z.number().positive('Price must be positive').finite('Price must be a finite number'),
  amenities: z.array(z.string()).optional().default([]),
  description: z.string().max(2000).optional().default(''),
  capacity: z.number().int().min(1).max(50).optional().default(1),
  imageUrl: z
    .string()
    .url('Image URL must be a valid URL')
    .optional()
    .default('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800'),
  university: z.string().optional().default(''),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

// ── Update Room (whitelisted fields only — prevents mass-assignment) ───────

export const UpdateRoomSchema = z.object({
  roomNumber: z.string().min(1).max(20).trim().optional(),
  type: z.enum(['Single', 'Double', 'Suite', 'Studio']).optional(),
  price: z.number().positive().finite().optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().max(2000).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  university: z.string().optional(),
  // Note: approvalStatus, wardenId, and _id are EXCLUDED — admins
  // must use the dedicated approve/reject endpoints for status changes.
});

export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;

// ── Room Query Params ──────────────────────────────────────────────────────

export const RoomQuerySchema = z.object({
  type: z.enum(['Single', 'Double', 'Suite', 'Studio']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  available: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
});

export type RoomQueryInput = z.infer<typeof RoomQuerySchema>;
