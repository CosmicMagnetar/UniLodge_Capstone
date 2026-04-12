/**
 * Price Calculation Utility Functions
 * Helper functions for pricing, discounts, and financial calculations
 */

/**
 * Calculate total booking price
 */
export function calculateBookingPrice(
  basePrice: number,
  numberOfDays: number,
  discountPercent: number = 0
): number {
  const subtotal = basePrice * numberOfDays;
  const discountAmount = (subtotal * discountPercent) / 100;
  return subtotal - discountAmount;
}

/**
 * Calculate price per day
 */
export function calculatePricePerDay(
  totalPrice: number,
  numberOfDays: number
): number {
  if (numberOfDays <= 0) return 0;
  return totalPrice / numberOfDays;
}

/**
 * Apply discount to price
 */
export function applyDiscount(price: number, discountPercent: number): number {
  const discount = (price * discountPercent) / 100;
  return price - discount;
}

/**
 * Calculate tax on price
 */
export function calculateTax(price: number, taxRate: number = 10): number {
  return (price * taxRate) / 100;
}

/**
 * Calculate total with tax
 */
export function calculateTotalWithTax(
  price: number,
  taxRate: number = 10
): number {
  const tax = calculateTax(price, taxRate);
  return price + tax;
}

/**
 * Calculate early bird discount (percentage discount for early booking)
 */
export function calculateEarlyBirdDiscount(
  basePrice: number,
  numberOfDays: number,
  daysInAdvance: number
): number {
  let discountPercent = 0;

  if (daysInAdvance >= 30) {
    discountPercent = 10; // 10% discount for 30+ days in advance
  } else if (daysInAdvance >= 14) {
    discountPercent = 5; // 5% discount for 14+ days in advance
  }

  return calculateBookingPrice(basePrice, numberOfDays, discountPercent);
}

/**
 * Calculate long-term stay discount
 */
export function calculateLongStayDiscount(
  basePrice: number,
  numberOfDays: number
): number {
  let discountPercent = 0;

  if (numberOfDays >= 60) {
    discountPercent = 15; // 15% discount for 60+ days
  } else if (numberOfDays >= 30) {
    discountPercent = 10; // 10% discount for 30+ days
  } else if (numberOfDays >= 14) {
    discountPercent = 5; // 5% discount for 14+ days
  }

  return calculateBookingPrice(basePrice, numberOfDays, discountPercent);
}

/**
 * Calculate seasonal pricing adjustment
 */
export function calculateSeasonalPrice(
  basePrice: number,
  month: number
): number {
  // Example: Higher prices during peak months (June-August)
  const peakMonths = [6, 7, 8]; // June, July, August
  const offPeakMonths = [12, 1]; // December, January

  let adjustment = 1.0;

  if (peakMonths.includes(month)) {
    adjustment = 1.2; // 20% increase
  } else if (offPeakMonths.includes(month)) {
    adjustment = 0.85; // 15% decrease
  }

  return basePrice * adjustment;
}

/**
 * Format price as currency
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(price);
}

/**
 * Round price to nearest cent
 */
export function roundPrice(price: number): number {
  return Math.round(price * 100) / 100;
}

/**
 * Calculate service fee
 */
export function calculateServiceFee(
  price: number,
  feePercent: number = 5
): number {
  return (price * feePercent) / 100;
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefundAmount(
  totalPrice: number,
  daysBeforeCancellation: number
): number {
  // Example policies
  if (daysBeforeCancellation > 14) {
    return totalPrice; // Full refund more than 14 days before
  } else if (daysBeforeCancellation > 7) {
    return totalPrice * 0.75; // 75% refund 7-14 days before
  } else if (daysBeforeCancellation > 0) {
    return totalPrice * 0.5; // 50% refund 0-7 days before
  }
  return 0; // No refund within 24 hours of check-in
}

/**
 * Calculate average price per night
 */
export function calculateAveragePricePerNight(
  rooms: Array<{ basePrice: number }>
): number {
  if (rooms.length === 0) return 0;
  const total = rooms.reduce((sum, room) => sum + room.basePrice, 0);
  return roundPrice(total / rooms.length);
}

/**
 * Check if price is within budget
 */
export function isPriceWithinBudget(
  price: number,
  maxBudget: number
): boolean {
  return price <= maxBudget;
}

/**
 * Calculate price difference
 */
export function calculatePriceDifference(
  originalPrice: number,
  newPrice: number
): { difference: number; percentChange: number } {
  const difference = newPrice - originalPrice;
  const percentChange = (difference / originalPrice) * 100;

  return {
    difference: roundPrice(difference),
    percentChange: roundPrice(percentChange),
  };
}
