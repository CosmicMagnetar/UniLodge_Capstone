/**
 * Price Utility Tests
 */

import { describe, it, expect } from "vitest";
import {
  calculateBookingPrice,
  calculatePricePerDay,
  applyDiscount,
  calculateTax,
  calculateTotalWithTax,
  calculateEarlyBirdDiscount,
  calculateLongStayDiscount,
  calculateSeasonalPrice,
  formatPrice,
  roundPrice,
  calculateServiceFee,
  calculateRefundAmount,
  isPriceWithinBudget,
  calculatePriceDifference,
} from "@/lib/utils/price";

describe("Price Utilities", () => {
  describe("calculateBookingPrice", () => {
    it("should calculate price without discount", () => {
      const price = calculateBookingPrice(100, 7, 0);
      expect(price).toBe(700);
    });

    it("should calculate price with discount", () => {
      const price = calculateBookingPrice(100, 7, 10);
      expect(price).toBe(630); // 700 * 0.9
    });

    it("should return 0 for 0 days", () => {
      const price = calculateBookingPrice(100, 0, 0);
      expect(price).toBe(0);
    });
  });

  describe("calculatePricePerDay", () => {
    it("should calculate price per day", () => {
      const price = calculatePricePerDay(700, 7);
      expect(price).toBe(100);
    });

    it("should return 0 for 0 days", () => {
      const price = calculatePricePerDay(700, 0);
      expect(price).toBe(0);
    });
  });

  describe("applyDiscount", () => {
    it("should apply percentage discount", () => {
      const price = applyDiscount(100, 20);
      expect(price).toBe(80);
    });

    it("should return 0 for 100% discount", () => {
      const price = applyDiscount(100, 100);
      expect(price).toBe(0);
    });
  });

  describe("calculateTax", () => {
    it("should calculate tax with default rate", () => {
      const tax = calculateTax(100); // 10% default
      expect(tax).toBe(10);
    });

    it("should calculate tax with custom rate", () => {
      const tax = calculateTax(100, 15);
      expect(tax).toBe(15);
    });
  });

  describe("calculateTotalWithTax", () => {
    it("should add tax to price", () => {
      const total = calculateTotalWithTax(100, 10);
      expect(total).toBe(110);
    });
  });

  describe("calculateEarlyBirdDiscount", () => {
    it("should apply 10% discount for 30+ days in advance", () => {
      const price = calculateEarlyBirdDiscount(100, 7, 30);
      expect(price).toBe(630); // 700 * 0.9
    });

    it("should apply 5% discount for 14+ days in advance", () => {
      const price = calculateEarlyBirdDiscount(100, 7, 14);
      expect(price).toBe(665); // 700 * 0.95
    });

    it("should apply no discount for less than 14 days", () => {
      const price = calculateEarlyBirdDiscount(100, 7, 5);
      expect(price).toBe(700);
    });
  });

  describe("calculateLongStayDiscount", () => {
    it("should apply 15% discount for 60+ days", () => {
      const price = calculateLongStayDiscount(100, 60);
      expect(price).toBe(5100); // 6000 * 0.85
    });

    it("should apply 10% discount for 30+ days", () => {
      const price = calculateLongStayDiscount(100, 30);
      expect(price).toBe(2700); // 3000 * 0.9
    });

    it("should apply 5% discount for 14+ days", () => {
      const price = calculateLongStayDiscount(100, 14);
      expect(price).toBe(1330); // 1400 * 0.95
    });

    it("should apply no discount for less than 14 days", () => {
      const price = calculateLongStayDiscount(100, 7);
      expect(price).toBe(700);
    });
  });

  describe("calculateSeasonalPrice", () => {
    it("should increase price for peak months", () => {
      const price = calculateSeasonalPrice(100, 7); // July
      expect(price).toBe(120);
    });

    it("should decrease price for off-peak months", () => {
      const price = calculateSeasonalPrice(100, 12); // December
      expect(price).toBe(85);
    });

    it("should keep normal price for regular months", () => {
      const price = calculateSeasonalPrice(100, 4); // April
      expect(price).toBe(100);
    });
  });

  describe("roundPrice", () => {
    it("should round to nearest cent", () => {
      const price = roundPrice(99.556);
      expect(price).toBe(99.56);
    });

    it("should round down correctly", () => {
      const price = roundPrice(99.544);
      expect(price).toBe(99.54);
    });
  });

  describe("calculateServiceFee", () => {
    it("should calculate service fee with default rate", () => {
      const fee = calculateServiceFee(100);
      expect(fee).toBe(5); // 5% default
    });

    it("should calculate service fee with custom rate", () => {
      const fee = calculateServiceFee(100, 10);
      expect(fee).toBe(10);
    });
  });

  describe("calculateRefundAmount", () => {
    it("should return full refund for >14 days", () => {
      const refund = calculateRefundAmount(700, 15);
      expect(refund).toBe(700);
    });

    it("should return 75% refund for 7-14 days", () => {
      const refund = calculateRefundAmount(700, 10);
      expect(refund).toBe(525);
    });

    it("should return 50% refund for 0-7 days", () => {
      const refund = calculateRefundAmount(700, 3);
      expect(refund).toBe(350);
    });

    it("should return 0 refund for negative days", () => {
      const refund = calculateRefundAmount(700, -1);
      expect(refund).toBe(0);
    });
  });

  describe("isPriceWithinBudget", () => {
    it("should return true when price is within budget", () => {
      const result = isPriceWithinBudget(500, 600);
      expect(result).toBe(true);
    });

    it("should return true when price equals budget", () => {
      const result = isPriceWithinBudget(600, 600);
      expect(result).toBe(true);
    });

    it("should return false when price exceeds budget", () => {
      const result = isPriceWithinBudget(700, 600);
      expect(result).toBe(false);
    });
  });

  describe("calculatePriceDifference", () => {
    it("should calculate positive difference", () => {
      const result = calculatePriceDifference(100, 120);
      expect(result.difference).toBe(20);
      expect(result.percentChange).toBe(20);
    });

    it("should calculate negative difference", () => {
      const result = calculatePriceDifference(100, 80);
      expect(result.difference).toBe(-20);
      expect(result.percentChange).toBe(-20);
    });
  });

  describe("formatPrice", () => {
    it("should format price as USD currency", () => {
      const formatted = formatPrice(100, "USD");
      expect(formatted).toContain("100");
    });
  });
});
