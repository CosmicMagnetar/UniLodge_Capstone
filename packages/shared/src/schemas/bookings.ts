import { z } from "zod";

/**
 * Booking types and schemas for validation
 */

export const BookingStatusEnum = z.enum([
  "Confirmed",
  "Pending",
  "Cancelled",
]);

export const PaymentStatusEnum = z.enum(["paid", "pending", "failed"]);

export const BookingSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  totalPrice: z.number().nonnegative().optional(),
  notes: z.string().optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

export const CreateBookingSchema = BookingSchema;

export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusEnum,
});

export const UpdatePaymentStatusSchema = z.object({
  paymentStatus: PaymentStatusEnum,
});

export const BookingRequestSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  message: z.string().max(500, "Message too long").optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

// Type exports
export type BookingStatus = z.infer<typeof BookingStatusEnum>;
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
