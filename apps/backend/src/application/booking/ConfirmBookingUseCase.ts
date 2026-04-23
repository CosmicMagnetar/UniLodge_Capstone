/**
 * ConfirmBookingUseCase - Application Service
 */

import { IBookingRepository } from '../../domain/repositories';

export interface ConfirmBookingInput {
  bookingId: string;
  userId: string; // For authorization check
}

export interface ConfirmBookingOutput {
  bookingId: string;
  status: string;
  message: string;
}

export class ConfirmBookingUseCase {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(input: ConfirmBookingInput): Promise<ConfirmBookingOutput> {
    // 1. Fetch booking
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new Error(`Booking ${input.bookingId} not found`);
    }

    // 2. Authorize (only booking owner or admin)
    if (booking.getUserId() !== input.userId) {
      throw new Error('Not authorized to confirm this booking');
    }

    // 3. Validate can confirm
    if (!booking.canConfirm()) {
      throw new Error(`Cannot confirm booking with status ${booking.getStatus()}`);
    }

    // 4. Perform state transition
    booking.confirm();

    // 5. Persist
    await this.bookingRepository.save(booking);

    return {
      bookingId: booking.getId(),
      status: booking.getStatus(),
      message: 'Booking confirmed successfully',
    };
  }
}
