/**
 * CreateBookingUseCase - Application Service
 * Orchestrates the booking creation workflow
 * SINGLE RESPONSIBILITY: Only creates bookings
 */

import { Booking } from '../domain/entities/Booking';
import { Room } from '../domain/entities/Room';
import { DateRange } from '../domain/value-objects/DateRange';
import { Price } from '../domain/value-objects/Price';
import {
  IBookingRepository,
  IRoomRepository,
  IUserRepository,
} from '../domain/repositories';
import { PricingService } from '../domain/services/PricingService';
import { AvailabilityService } from '../domain/services/AvailabilityService';

/**
 * INPUT: DTO for creating booking
 */
export interface CreateBookingInput {
  userId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
}

/**
 * OUTPUT: DTO response after booking creation
 */
export interface CreateBookingOutput {
  bookingId: string;
  roomId: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  nights: number;
  totalPrice: number;
  status: string;
}

/**
 * USE CASE: Create Booking
 * Orchestrates the process of creating a new booking
 * Dependencies injected via constructor (DIP)
 */
export class CreateBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private roomRepository: IRoomRepository,
    private userRepository: IUserRepository,
    private pricingService: PricingService,
    private availabilityService: AvailabilityService
  ) {}

  async execute(input: CreateBookingInput): Promise<CreateBookingOutput> {
    // 1. Validate user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error(`User ${input.userId} not found`);
    }

    // 2. Validate room exists
    const room = await this.roomRepository.findById(input.roomId);
    if (!room) {
      throw new Error(`Room ${input.roomId} not found`);
    }

    // 3. Validate room is available
    if (!room.canBeBooked()) {
      throw new Error('Room is not available for booking');
    }

    // 4. Create date range (Value Object - validates dates)
    const dateRange = new DateRange(input.checkInDate, input.checkOutDate);

    // 5. Check room availability for dates
    const isAvailable = await this.availabilityService.isAvailable(
      input.roomId,
      dateRange
    );

    if (!isAvailable) {
      throw new Error('Room is not available for the requested dates');
    }

    // 6. Validate guest count
    if (!room.canAccommodate(input.guestCount)) {
      throw new Error(`Room can only accommodate ${room.getCapacity()} guests`);
    }

    // 7. Calculate price using pricing service
    const totalPrice = this.pricingService.calculatePrice(
      room,
      dateRange,
      input.guestCount
    );

    // 8. Create booking entity
    const booking = new Booking({
      id: this.generateId(),
      roomId: input.roomId,
      userId: input.userId,
      dateRange,
      totalPrice,
      status: 'Pending',
      paymentStatus: 'unpaid',
      checkInCompleted: false,
      checkOutCompleted: false,
      createdAt: new Date(),
    });

    // 9. Persist booking
    await this.bookingRepository.save(booking);

    // 10. Return response DTO
    return {
      bookingId: booking.getId(),
      roomId: booking.getRoomId(),
      userId: booking.getUserId(),
      checkInDate: booking.getCheckInDate(),
      checkOutDate: booking.getCheckOutDate(),
      nights: booking.getNights(),
      totalPrice: booking.getTotalPrice().value,
      status: booking.getStatus(),
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
