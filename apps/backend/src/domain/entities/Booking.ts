/**
 * Booking Domain Entity
 * Core business logic for bookings
 * Extracted from controller into domain layer
 */

import { DateRange } from '../value-objects/DateRange';
import { Price } from '../value-objects/Price';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface BookingProps {
  id: string;
  roomId: string;
  userId: string;
  dateRange: DateRange;
  totalPrice: Price;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
  checkInCompleted: boolean;
  checkOutCompleted: boolean;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
}

/**
 * DOMAIN ENTITY: Booking
 * Encapsulates booking business rules
 * SRP: Only responsible for booking logic, not HTTP or persistence
 */
export class Booking {
  private readonly id: string;
  private readonly roomId: string;
  private readonly userId: string;
  private readonly dateRange: DateRange;
  private readonly totalPrice: Price;
  private status: BookingStatus;
  private paymentStatus: PaymentStatus;
  private paymentDate?: Date;
  private paymentMethod?: string;
  private transactionId?: string;
  private checkInCompleted: boolean;
  private checkOutCompleted: boolean;
  private checkInTime?: Date;
  private checkOutTime?: Date;
  private readonly createdAt: Date;

  constructor(props: BookingProps) {
    this.id = props.id;
    this.roomId = props.roomId;
    this.userId = props.userId;
    this.dateRange = props.dateRange;
    this.totalPrice = props.totalPrice;
    this.status = props.status;
    this.paymentStatus = props.paymentStatus;
    this.paymentDate = props.paymentDate;
    this.paymentMethod = props.paymentMethod;
    this.transactionId = props.transactionId;
    this.checkInCompleted = props.checkInCompleted;
    this.checkOutCompleted = props.checkOutCompleted;
    this.checkInTime = props.checkInTime;
    this.checkOutTime = props.checkOutTime;
    this.createdAt = props.createdAt;
  }

  // ============ GETTERS ============
  getId(): string {
    return this.id;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getUserId(): string {
    return this.userId;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getNights(): number {
    return this.dateRange.nights;
  }

  getCheckInDate(): Date {
    return this.dateRange.checkIn;
  }

  getCheckOutDate(): Date {
    return this.dateRange.checkOut;
  }

  getTotalPrice(): Price {
    return this.totalPrice;
  }

  getStatus(): BookingStatus {
    return this.status;
  }

  getPaymentStatus(): PaymentStatus {
    return this.paymentStatus;
  }

  getPaymentDate(): Date | undefined {
    return this.paymentDate;
  }

  getPaymentMethod(): string | undefined {
    return this.paymentMethod;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  isCheckInCompleted(): boolean {
    return this.checkInCompleted;
  }

  isCheckOutCompleted(): boolean {
    return this.checkOutCompleted;
  }

  getCheckInTime(): Date | undefined {
    return this.checkInTime;
  }

  getCheckOutTime(): Date | undefined {
    return this.checkOutTime;
  }

  getTransactionId(): string | undefined {
    return this.transactionId;
  }

  // ============ BUSINESS RULES ============

  /**
   * RULE: Can only cancel pending bookings
   */
  canCancel(): boolean {
    return this.status === 'Pending';
  }

  /**
   * RULE: Can only confirm pending bookings
   */
  canConfirm(): boolean {
    return this.status === 'Pending';
  }

  /**
   * RULE: Can only check in if confirmed and not already checked in
   */
  canCheckIn(): boolean {
    return this.status === 'Confirmed' && !this.checkInCompleted;
  }

  /**
   * RULE: Can only check out if checked in and not already checked out
   */
  canCheckOut(): boolean {
    return this.checkInCompleted && !this.checkOutCompleted;
  }

  /**
   * RULE: Extract refund amount based on cancellation policy
   * Full refund: 14+ days before check-in
   * 50% refund: 7-13 days before check-in
   * No refund: Less than 7 days before check-in
   */
  calculateRefund(): Price {
    const now = new Date();
    const daysBefore = Math.ceil(
      (this.dateRange.checkIn.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (daysBefore >= 14) {
      return this.totalPrice; // Full refund
    }

    if (daysBefore >= 7) {
      return this.totalPrice.withMarkup(-50); // 50% refund
    }

    return new Price(0); // No refund
  }

  /**
   * RULE: Check if already past check-in time
   */
  isPastCheckIn(): boolean {
    return new Date() > this.dateRange.checkIn;
  }

  /**
   * RULE: Check if already past check-out date
   */
  isPastCheckOut(): boolean {
    return new Date() >= this.dateRange.checkOut;
  }

  /**
   * RULE: Get days until check-in (negative if past)
   */
  getDaysUntilCheckIn(): number {
    const now = new Date();
    const days = Math.ceil(
      (this.dateRange.checkIn.getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
    );
    return days;
  }

  /**
   * RULE: Check if within check-in window (same day as check-in)
   */
  isWithinCheckInWindow(): boolean {
    const now = new Date();
    const checkInDay = new Date(this.dateRange.checkIn);
    const checkOutDay = new Date(this.dateRange.checkIn);
    checkOutDay.setHours(23, 59, 59, 999);

    return now >= checkInDay && now <= checkOutDay;
  }

  // ============ STATE TRANSITIONS ============

  /**
   * ACTION: Confirm a pending booking
   */
  confirm(): void {
    if (!this.canConfirm()) {
      throw new Error(`Cannot confirm booking with status ${this.status}`);
    }
    this.status = 'Confirmed';
  }

  /**
   * ACTION: Cancel booking and return refund amount
   */
  cancel(): Price {
    if (!this.canCancel()) {
      throw new Error(`Cannot cancel booking with status ${this.status}`);
    }

    const refund = this.calculateRefund();
    this.status = 'Cancelled';

    return refund;
  }

  /**
   * ACTION: Complete check-in
   */
  completeCheckIn(): void {
    if (!this.canCheckIn()) {
      throw new Error('Cannot check in at this time');
    }

    this.checkInCompleted = true;
    this.checkInTime = new Date();
  }

  /**
   * ACTION: Complete check-out
   */
  completeCheckOut(): void {
    if (!this.canCheckOut()) {
      throw new Error('Cannot check out at this time');
    }

    this.checkOutCompleted = true;
    this.checkOutTime = new Date();

    // Auto-complete booking if both check-in and check-out done
    if (this.checkInCompleted && this.checkOutCompleted) {
      this.status = 'Completed';
    }
  }

  /**
   * ACTION: Record payment
   */
  recordPayment(
    amount: Price,
    method: string,
    transactionId: string
  ): void {
    if (!amount.equals(this.totalPrice)) {
      throw new Error('Payment amount does not match booking total');
    }

    this.paymentStatus = 'paid';
    this.paymentDate = new Date();
    this.paymentMethod = method;
    this.transactionId = transactionId;
  }

  /**
   * ACTION: Process refund
   */
  processRefund(): Price {
    const refund = this.calculateRefund();

    this.paymentStatus = 'refunded';
    this.paymentDate = undefined;

    return refund;
  }

  // ============ SERIALIZATION ============

  /**
   * Convert to DTO for API response
   */
  toDTO() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      checkInDate: this.dateRange.checkIn,
      checkOutDate: this.dateRange.checkOut,
      nights: this.getNights(),
      totalPrice: this.totalPrice.value,
      status: this.status,
      paymentStatus: this.paymentStatus,
      paymentDate: this.paymentDate,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      checkInCompleted: this.checkInCompleted,
      checkOutCompleted: this.checkOutCompleted,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create booking from database record
   */
  static fromDB(data: any): Booking {
    return new Booking({
      id: data._id?.toString() || data.id,
      roomId: data.roomId?.toString() || data.roomId,
      userId: data.userId?.toString() || data.userId,
      dateRange: new DateRange(data.checkInDate, data.checkOutDate),
      totalPrice: new Price(data.totalPrice),
      status: data.status,
      paymentStatus: data.paymentStatus,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      checkInCompleted: data.checkInCompleted || false,
      checkOutCompleted: data.checkOutCompleted || false,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      createdAt: data.createdAt,
    });
  }
}
