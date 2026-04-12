import { z } from "zod";

/**
 * Analytics types and schemas for data validation
 */

export const DateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const AnalyticsFilterSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  roomId: z.string().uuid().optional(),
  wardenId: z.string().uuid().optional(),
});

// Type exports
export type DateRange = z.infer<typeof DateRangeSchema>;
export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;
