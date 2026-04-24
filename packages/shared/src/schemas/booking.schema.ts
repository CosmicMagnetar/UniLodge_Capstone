/**
 * Booking Validation Schemas — Zod
 * Prevents NaN/undefined data corruption on all booking endpoints.
 */

import { z } from 'zod';

// ── Reusable primitives ────────────────────────────────────────────────────

/** MongoDB ObjectId format: 24-char hex string */
const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Must be a valid 24-character ObjectId');

/** ISO 8601 date string that actually parses to a valid Date */
const isoDate = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Must be a valid ISO 8601 date string',
  })
  .transform((val) => new Date(val));

// ── Create Booking ─────────────────────────────────────────────────────────

export const CreateBookingSchema = z
  .object({
    roomId: objectId,
    checkInDate: isoDate,
    checkOutDate: isoDate,
    guestCount: z.number().int().min(1).max(20).optional().default(1),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: 'checkOutDate must be after checkInDate',
    path: ['checkOutDate'],
  });

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// ── Update Booking Status ──────────────────────────────────────────────────

export const UpdateBookingStatusSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Cancelled', 'Completed']),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;

// ── Process Payment ────────────────────────────────────────────────────────

export const ProcessPaymentSchema = z.object({
  paymentMethod: z
    .enum(['credit_card', 'debit_card', 'upi', 'bank_transfer'])
    .default('credit_card'),
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentSchema>;

// ── Create Booking Request ─────────────────────────────────────────────────

export const CreateBookingRequestSchema = z
  .object({
    roomId: objectId,
    checkInDate: isoDate,
    checkOutDate: isoDate,
    message: z
      .string()
      .max(1000, 'Message must be 1000 characters or fewer')
      .optional()
      .default(''),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: 'checkOutDate must be after checkInDate',
    path: ['checkOutDate'],
  });

export type CreateBookingRequestInput = z.infer<typeof CreateBookingRequestSchema>;

// ── Chat Message ───────────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message must be 10000 characters or fewer'),
  context: z.string().max(5000).optional(),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;

// ── Room Recommendations ───────────────────────────────────────────────────

export const RoomRecommendationsSchema = z.object({
  budget: z.number().positive('Budget must be positive'),
  preferences: z.array(z.string()).optional().default([]),
  location: z.string().optional().default(''),
});

export type RoomRecommendationsInput = z.infer<typeof RoomRecommendationsSchema>;
