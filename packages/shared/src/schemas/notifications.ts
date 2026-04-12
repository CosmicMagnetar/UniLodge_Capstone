import { z } from "zod";

/**
 * Notification types and schemas for validation
 */

export const NotificationTypeEnum = z.enum([
  "booking_request",
  "booking_update",
  "booking_confirmation",
  "payment_success",
  "review_posted",
  "message",
  "system",
]);

export const NotificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  message: z.string().min(1).max(500),
  type: NotificationTypeEnum,
  relatedId: z.string().uuid().optional(),
  read: z.boolean().default(false),
});

export const CreateNotificationSchema = NotificationSchema.omit({
  userId: true,
  read: true,
});

export const UpdateNotificationSchema = z.object({
  read: z.boolean(),
});

// Type exports
export type NotificationType = z.infer<typeof NotificationTypeEnum>;
export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;
