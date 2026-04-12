/**
 * Price Value Object
 * Represents an immutable price with validation and calculations
 */

export class InvalidPriceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPriceError';
  }
}

export class Price {
  private readonly amount: number;

  constructor(amount: number) {
    if (!Number.isFinite(amount)) {
      throw new InvalidPriceError('Price must be a finite number');
    }

    if (amount < 0) {
      throw new InvalidPriceError('Price cannot be negative');
    }

    // Round to 2 decimal places to avoid floating point errors
    this.amount = Math.round(amount * 100) / 100;
  }

  get value(): number {
    return this.amount;
  }

  /**
   * Calculate price for multiple nights
   */
  forNights(nights: number): Price {
    if (nights < 1) {
      throw new InvalidPriceError('Number of nights must be at least 1');
    }

    return new Price(this.amount * nights);
  }

  /**
   * Apply a percentage discount
   */
  withDiscount(discountPercent: number): Price {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new InvalidPriceError('Discount must be between 0 and 100');
    }

    const discountedAmount = this.amount * (1 - discountPercent / 100);
    return new Price(discountedAmount);
  }

  /**
   * Apply a percentage markup
   */
  withMarkup(markupPercent: number): Price {
    if (markupPercent < 0) {
      throw new InvalidPriceError('Markup cannot be negative');
    }

    const markedUpAmount = this.amount * (1 + markupPercent / 100);
    return new Price(markedUpAmount);
  }

  /**
   * Add another price
   */
  add(other: Price): Price {
    return new Price(this.amount + other.amount);
  }

  /**
   * Subtract another price
   */
  subtract(other: Price): Price {
    return new Price(this.amount - other.amount);
  }

  /**
   * Check if price is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if price is positive
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Check if this price is greater than another
   */
  isGreaterThan(other: Price): boolean {
    return this.amount > other.amount;
  }

  /**
   * Check if this price is less than another
   */
  isLessThan(other: Price): boolean {
    return this.amount < other.amount;
  }

  /**
   * Check equality
   */
  equals(other: Price): boolean {
    return this.amount === other.amount;
  }

  /**
   * Currency formatting
   */
  toFormattedString(currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    });
    return formatter.format(this.amount);
  }

  toString(): string {
    return `$${this.amount.toFixed(2)}`;
  }
}
