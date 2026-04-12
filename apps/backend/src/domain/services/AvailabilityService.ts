/**
 * AvailabilityService - Domain Service
 * Handles room availability checking
 */

import { IBookingRepository } from '../repositories';
import { DateRange } from '../value-objects/DateRange';

/**
 * DOMAIN SERVICE: AvailabilityService
 * SRP: Only responsible for availability logic
 */
export class AvailabilityService {
  constructor(private bookingRepository: IBookingRepository) {}

  /**
   * Check if room is available for the given date range
   * Returns false if any confirmed booking overlaps
   */
  async isAvailable(roomId: string, dateRange: DateRange): Promise<boolean> {
    const overlappingBookings = await this.bookingRepository.findOverlapping(
      roomId,
      dateRange
    );

    // Allow overlaps if all are cancelled
    const confirmedOverlaps = overlappingBookings.filter(
      b => b.getStatus() === 'Confirmed' || b.getStatus() === 'Pending'
    );

    return confirmedOverlaps.length === 0;
  }

  /**
   * Get available date ranges for a room
   */
  async getAvailableDateRanges(
    roomId: string,
    searchStart: Date,
    searchEnd: Date
  ): Promise<DateRange[]> {
    const searchRange = new DateRange(searchStart, searchEnd);
    const bookings = await this.bookingRepository.findByRoomId(roomId);

    // Filter to only overlapping bookings
    const overlappingBookings = bookings.filter(b =>
      b.getDateRange().overlaps(searchRange) &&
      (b.getStatus() === 'Confirmed' || b.getStatus() === 'Pending')
    );

    // Calculate available periods
    let currentDate = new Date(searchStart);
    const availability: DateRange[] = [];
    const occupiedDates = overlappingBookings.map(b => b.getDateRange());

    while (currentDate < searchEnd) {
      const endOfDay = new Date(currentDate);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const dayRange = new DateRange(currentDate, endOfDay);

      // Check if this day overlaps with any bookings
      const hasConflict = occupiedDates.some(occupied =>
        occupied.overlaps(dayRange)
      );

      if (!hasConflict) {
        if (
          availability.length > 0 &&
          availability[availability.length - 1].isConsecutiveWith(dayRange)
        ) {
          // Merge with previous range
          availability[availability.length - 1] = availability[
            availability.length - 1
          ].merge(dayRange);
        } else {
          availability.push(dayRange);
        }
      }

      currentDate = endOfDay;
    }

    return availability;
  }

  /**
   * Find the next available date for a room
   */
  async getNextAvailableDate(roomId: string): Promise<Date | null> {
    const searchEnd = new Date();
    searchEnd.setDate(searchEnd.getDate() + 365); // Search next year

    const ranges = await this.getAvailableDateRanges(
      roomId,
      new Date(),
      searchEnd
    );

    return ranges.length > 0 ? ranges[0].checkIn : null;
  }

  /**
   * Check if a user can make a booking
   * (e.g., not too many pending bookings, no ongoing disputes)
   */
  async canUserBook(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    // This could be extended with business rules like:
    // - User has no open disputes
    // - User hasn't exceeded booking limit
    // - User account is in good standing

    return { allowed: true };
  }
}
