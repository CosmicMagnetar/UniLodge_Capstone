/**
 * PricingService - Domain Service
 * Handles price calculation with different strategies
 * Strategy Pattern + Dependency Inversion
 */

import { Room } from '../entities/Room';
import { Price } from '../value-objects/Price';
import { DateRange } from '../value-objects/DateRange';

/**
 * STRATEGY INTERFACE: Different pricing algorithms
 */
export interface IPricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange, guestCount: number): Price;

  getName(): string;
}

/**
 * STRATEGY: Standard pricing (base price per night)
 */
export class StandardPricingStrategy implements IPricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Price {
    return room.getPricePerNight().forNights(dateRange.nights);
  }

  getName(): string {
    return 'standard';
  }
}

/**
 * STRATEGY: Seasonal pricing (higher in summer, lower off-season)
 */
export class SeasonalPricingStrategy implements IPricingStrategy {
  calculatePrice(room: Room, dateRange: DateRange): Price {
    const basePrice = room.getPricePerNight().forNights(dateRange.nights);

    // Check if falls in peak season (Jun-Aug)
    const monthsInRange = this.getMonthsInRange(dateRange);
    const peakMonths = monthsInRange.filter(m => m >= 6 && m <= 8).length;
    const peakPercentage = peakMonths / monthsInRange.length;

    if (peakPercentage > 0.5) {
      return basePrice.withMarkup(30); // 30% markup in peak season
    }

    return basePrice.withMarkup(-10); // 10% discount off-season
  }

  private getMonthsInRange(dateRange: DateRange): number[] {
    const months: number[] = [];
    const current = new Date(dateRange.checkIn);

    while (current < dateRange.checkOut) {
      months.push(current.getMonth() + 1); // 1-12
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  getName(): string {
    return 'seasonal';
  }
}

/**
 * STRATEGY: Loyalty pricing (discount for repeat customers)
 */
export class LoyaltyPricingStrategy implements IPricingStrategy {
  constructor(private bookingCount: number) {}

  calculatePrice(room: Room, dateRange: DateRange): Price {
    const basePrice = room.getPricePerNight().forNights(dateRange.nights);

    if (this.bookingCount > 20) return basePrice.withDiscount(25); // 25% off
    if (this.bookingCount > 10) return basePrice.withDiscount(20); // 20% off
    if (this.bookingCount > 5) return basePrice.withDiscount(10); // 10% off

    return basePrice;
  }

  getName(): string {
    return 'loyalty';
  }
}

/**
 * DOMAIN SERVICE: PricingService
 * Orchestrates pricing strategies
 * OCP: Open for extension (new strategies), closed for modification
 */
export class PricingService {
  private strategy: IPricingStrategy;

  constructor(initialStrategy: IPricingStrategy = new StandardPricingStrategy()) {
    this.strategy = initialStrategy;
  }

  /**
   * Set pricing strategy at runtime
   */
  setStrategy(strategy: IPricingStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get current strategy name
   */
  getStrategy(): string {
    return this.strategy.getName();
  }

  /**
   * Calculate price using current strategy
   */
  calculatePrice(
    room: Room,
    dateRange: DateRange,
    guestCount: number = 1
  ): Price {
    if (!room.canBeBooked()) {
      throw new Error('Room is not available for booking');
    }

    if (!room.canAccommodate(guestCount)) {
      throw new Error(`Room can only accommodate ${room.getCapacity()} guests`);
    }

    return this.strategy.calculatePrice(room, dateRange, guestCount);
  }
}
