/**
 * DateRange Value Object
 * Represents an immutable date range with business logic
 * Used in Booking and Room availability
 */

export class InvalidDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}

export class DateRange {
  private readonly checkInDate: Date;
  private readonly checkOutDate: Date;

  constructor(checkInDate: Date, checkOutDate: Date) {
    if (checkOutDate <= checkInDate) {
      throw new InvalidDateRangeError('Check-out date must be after check-in date');
    }

    this.checkInDate = this.normalizeDate(checkInDate);
    this.checkOutDate = this.normalizeDate(checkOutDate);
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  get checkIn(): Date {
    return new Date(this.checkInDate);
  }

  get checkOut(): Date {
    return new Date(this.checkOutDate);
  }

  get nights(): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (this.checkOutDate.getTime() - this.checkInDate.getTime()) /
      millisecondsPerDay
    );
  }

  /**
   * Check if this date range overlaps with another
   * Two ranges overlap if one starts before the other ends
   */
  overlaps(other: DateRange): boolean {
    return (
      this.checkInDate < other.checkOutDate &&
      this.checkOutDate > other.checkInDate
    );
  }

  /**
   * Check if a specific date falls within this range
   */
  contains(date: Date): boolean {
    return date >= this.checkInDate && date < this.checkOutDate;
  }

  /**
   * Check if this range contains another range
   */
  containsRange(other: DateRange): boolean {
    return (
      this.checkInDate <= other.checkInDate &&
      this.checkOutDate >= other.checkOutDate
    );
  }

  /**
   * Get the intersection of two overlapping ranges
   */
  intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const checkIn = this.checkInDate > other.checkInDate
      ? this.checkInDate
      : other.checkInDate;

    const checkOut = this.checkOutDate < other.checkOutDate
      ? this.checkOutDate
      : other.checkOutDate;

    return new DateRange(checkIn, checkOut);
  }

  /**
   * Check if this date range is immediately consecutive with another
   * (one ends exactly when the other starts)
   */
  isConsecutiveWith(other: DateRange): boolean {
    return (
      this.checkOutDate.getTime() === other.checkInDate.getTime() ||
      other.checkOutDate.getTime() === this.checkInDate.getTime()
    );
  }

  /**
   * Merge two consecutive or overlapping date ranges
   */
  merge(other: DateRange): DateRange {
    if (!this.overlaps(other) && !this.isConsecutiveWith(other)) {
      throw new InvalidDateRangeError('Date ranges must overlap or be consecutive to merge');
    }

    const checkIn = this.checkInDate < other.checkInDate
      ? this.checkInDate
      : other.checkInDate;

    const checkOut = this.checkOutDate > other.checkOutDate
      ? this.checkOutDate
      : other.checkOutDate;

    return new DateRange(checkIn, checkOut);
  }

  /**
   * Add days to the check-out date
   */
  extendBy(days: number): DateRange {
    const newCheckOut = new Date(this.checkOutDate);
    newCheckOut.setDate(newCheckOut.getDate() + days);
    return new DateRange(this.checkInDate, newCheckOut);
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `${this.checkInDate.toISOString().split('T')[0]} to ${this.checkOutDate.toISOString().split('T')[0]} (${this.nights} nights)`;
  }

  /**
   * Equality check
   */
  equals(other: DateRange): boolean {
    return (
      this.checkInDate.getTime() === other.checkInDate.getTime() &&
      this.checkOutDate.getTime() === other.checkOutDate.getTime()
    );
  }
}
