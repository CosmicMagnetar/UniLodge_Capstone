/**
 * Date Utility Functions
 * Helper functions for working with dates in the booking system
 */

/**
 * Calculate number of days between two dates
 */
export function calculateDays(checkInDate: Date, checkOutDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / msPerDay
  );
}

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Get start of day (00:00:00)
 */
export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59)
 */
export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if two date ranges overlap
 */
export function doDateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get difference in days between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Check if date is within a date range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Get list of dates in a range
 */
export function getDateRangeArray(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export function formatDateDisplay(date: Date, locale: string = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get the month and year string
 */
export function getMonthYearString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
