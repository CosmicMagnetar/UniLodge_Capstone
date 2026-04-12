/**
 * Date Utility Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateDays,
  isDateInPast,
  isDateInFuture,
  formatDateISO,
  parseISODate,
  getStartOfDay,
  getEndOfDay,
  doDateRangesOverlap,
  addDays,
  getDaysDifference,
  isDateInRange,
  getDateRangeArray,
  formatDateDisplay,
  getMonthYearString,
} from "@/lib/utils/date";

describe("Date Utilities", () => {
  let today: Date;

  beforeEach(() => {
    today = new Date();
    today.setHours(12, 0, 0, 0);
  });

  describe("calculateDays", () => {
    it("should calculate days between two dates", () => {
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-07");
      expect(calculateDays(start, end)).toBe(6);
    });

    it("should handle same day", () => {
      const date = new Date("2024-06-01");
      expect(calculateDays(date, date)).toBe(0);
    });

    it("should handle negative spans", () => {
      const start = new Date("2024-06-07");
      const end = new Date("2024-06-01");
      expect(calculateDays(start, end)).toBeLessThan(0);
    });
  });

  describe("isDateInPast", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isDateInPast(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isDateInPast(futureDate)).toBe(false);
    });

    it("should return false for today", () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(isDateInPast(today)).toBe(false);
    });
  });

  describe("isDateInFuture", () => {
    it("should return true for future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isDateInFuture(futureDate)).toBe(true);
    });

    it("should return false for past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isDateInFuture(pastDate)).toBe(false);
    });
  });

  describe("formatDateISO", () => {
    it("should format date as YYYY-MM-DD", () => {
      const date = new Date("2024-06-01");
      const formatted = formatDateISO(date);
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it("should pad month and day with zeros", () => {
      const date = new Date("2024-01-05");
      const formatted = formatDateISO(date);
      expect(formatted).toContain("2024-01-05");
    });
  });

  describe("parseISODate", () => {
    it("should parse ISO date string to Date", () => {
      const parsed = parseISODate("2024-06-01");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2024);
    });
  });

  describe("getStartOfDay", () => {
    it("should set time to 00:00:00", () => {
      const date = new Date("2024-06-01T15:30:45");
      const start = getStartOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe("getEndOfDay", () => {
    it("should set time to 23:59:59", () => {
      const date = new Date("2024-06-01T10:30:00");
      const end = getEndOfDay(date);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe("doDateRangesOverlap", () => {
    it("should detect overlapping ranges", () => {
      const start1 = new Date("2024-06-01");
      const end1 = new Date("2024-06-07");
      const start2 = new Date("2024-06-05");
      const end2 = new Date("2024-06-10");
      expect(doDateRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it("should return false for non-overlapping ranges", () => {
      const start1 = new Date("2024-06-01");
      const end1 = new Date("2024-06-05");
      const start2 = new Date("2024-06-06");
      const end2 = new Date("2024-06-10");
      expect(doDateRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it("should return false for adjacent ranges (no overlap)", () => {
      const start1 = new Date("2024-06-01");
      const end1 = new Date("2024-06-05");
      const start2 = new Date("2024-06-05");
      const end2 = new Date("2024-06-10");
      // Adjacent ranges don't overlap in booking systems
      expect(doDateRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe("addDays", () => {
    it("should add positive days", () => {
      const date = new Date("2024-06-01");
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    it("should subtract with negative days", () => {
      const date = new Date("2024-06-10");
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(5);
    });

    it("should not mutate original date", () => {
      const date = new Date("2024-06-01");
      addDays(date, 5);
      expect(date.getDate()).toBe(1);
    });
  });

  describe("getDaysDifference", () => {
    it("should calculate days between dates", () => {
      const date1 = new Date("2024-06-01");
      const date2 = new Date("2024-06-07");
      expect(getDaysDifference(date1, date2)).toBe(6);
    });

    it("should return negative for past date", () => {
      const date1 = new Date("2024-06-07");
      const date2 = new Date("2024-06-01");
      expect(getDaysDifference(date1, date2)).toBeLessThan(0);
    });
  });

  describe("isDateInRange", () => {
    it("should return true for date in range", () => {
      const date = new Date("2024-06-05");
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-10");
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it("should return true for start date", () => {
      const date = new Date("2024-06-01");
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-10");
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    it("should return false for date outside range", () => {
      const date = new Date("2024-06-15");
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-10");
      expect(isDateInRange(date, start, end)).toBe(false);
    });
  });

  describe("getDateRangeArray", () => {
    it("should return array of dates", () => {
      const start = new Date("2024-06-01");
      const end = new Date("2024-06-03");
      const range = getDateRangeArray(start, end);
      expect(range.length).toBe(3);
      expect(range[0]).toEqual(start);
    });

    it("should handle single day range", () => {
      const date = new Date("2024-06-01");
      const range = getDateRangeArray(date, date);
      expect(range.length).toBe(1);
    });
  });

  describe("formatDateDisplay", () => {
    it("should format date for display", () => {
      const date = new Date("2024-06-15");
      const formatted = formatDateDisplay(date);
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("getMonthYearString", () => {
    it("should return YYYY-MM format", () => {
      const date = new Date("2024-06-15");
      expect(getMonthYearString(date)).toBe("2024-06");
    });

    it("should pad month with zero", () => {
      const date = new Date("2024-01-15");
      expect(getMonthYearString(date)).toBe("2024-01");
    });
  });
});
