import { z } from 'zod';

/**
 * Zod Validation Schemas
 * 
 * ISP: Each schema defines ONLY the fields needed for that specific operation.
 * Controllers no longer accept `body: any` — every request body is validated.
 */

// ═══════════════════════════════════════
// Auth Schemas
// ═══════════════════════════════════════

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ═══════════════════════════════════════
// Room Schemas
// ═══════════════════════════════════════

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required').trim(),
  type: z.enum(['Single', 'Double', 'Suite', 'Studio']),
  price: z.number().min(0, 'Price must be non-negative'),
  amenities: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(''),
  capacity: z.number().min(1).optional().default(1),
  imageUrl: z.string().url().optional(),
  university: z.string().optional().default(''),
});

export const updateRoomSchema = createRoomSchema.partial();

// ═══════════════════════════════════════
// Booking Schemas
// ═══════════════════════════════════════

export const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']),
});

export const processPaymentSchema = z.object({
  paymentMethod: z.string().optional().default('credit_card'),
});

// ═══════════════════════════════════════
// Booking Request Schemas
// ═══════════════════════════════════════

export const createBookingRequestSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  message: z.string().optional().default(''),
});

// ═══════════════════════════════════════
// Contact Schemas
// ═══════════════════════════════════════

export const submitContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export const updateContactStatusSchema = z.object({
  status: z.enum(['new', 'replied', 'resolved']),
});

// ═══════════════════════════════════════
// Type Exports (inferred from schemas)
// ═══════════════════════════════════════

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type CreateBookingRequestInput = z.infer<typeof createBookingRequestSchema>;
export type SubmitContactInput = z.infer<typeof submitContactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
