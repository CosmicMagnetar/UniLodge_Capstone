/**
 * BookingController -  HTTP Layer
 * THIN CONTROLLER: Only handles HTTP (request/response)
 * All business logic is in Use Cases and Domain Services
 * SRP: Single responsibility - HTTP handling only
 */

import { Response } from 'express';
import { AuthRequest } from '../../../types';
import { CreateBookingUseCase, CreateBookingInput } from '../../../application/booking/CreateBookingUseCase';
import { ConfirmBookingUseCase } from '../../../application/booking/ConfirmBookingUseCase';
import { IBookingRepository } from '../../../domain/repositories';
import { ErrorHandler, AppError, ValidationError, AuthorizationError, NotFoundError } from '../../../shared/errors/AppError';

/**
 * CONTROLLER: BookingController
 * Thin controller that delegates to use cases
 */
export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private confirmBookingUseCase: ConfirmBookingUseCase,
    private bookingRepository: IBookingRepository
  ) {}

  /**
   * HTTP POST /api/bookings
   * Create a new booking
   */
  async createBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 1. Validate request
      const input: CreateBookingInput = {
        userId: req.user!.id,
        roomId: req.body.roomId,
        checkInDate: new Date(req.body.checkInDate),
        checkOutDate: new Date(req.body.checkOutDate),
        guestCount: req.body.guestCount || 1,
      };

      if (!input.roomId) {
        throw new ValidationError('roomId is required');
      }

      if (!input.checkInDate || !input.checkOutDate) {
        throw new ValidationError('Check-in and check-out dates are required');
      }

      if (isNaN(input.checkInDate.getTime()) || isNaN(input.checkOutDate.getTime())) {
        throw new ValidationError('Invalid date format');
      }

      // 2. Execute use case (business logic happens here)
      const output = await this.createBookingUseCase.execute(input);

      // 3. Return response
      res.status(201).json({
        success: true,
        data: output,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * HTTP GET /api/bookings
   * Get bookings (user's own or all if admin)
   */
  async getBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bookings = req.user?.role === 'ADMIN'
        ? await this.bookingRepository.findActive()
        : await this.bookingRepository.findByUserId(req.user!.id);

      res.json({
        success: true,
        data: bookings.map(b => b.toDTO()),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * HTTP GET /api/bookings/:id
   * Get specific booking
   */
  async getBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const booking = await this.bookingRepository.findById(req.params.id);

      if (!booking) {
        throw new NotFoundError('Booking', req.params.id);
      }

      // Check authorization
      if (
        req.user?.role !== 'ADMIN' &&
        booking.getUserId() !== req.user?.id
      ) {
        throw new AuthorizationError('You do not have access to this booking');
      }

      res.json({
        success: true,
        data: booking.toDTO(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * HTTP POST /api/bookings/:id/confirm
   * Confirm a booking
   */
  async confirmBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const output = await this.confirmBookingUseCase.execute({
        bookingId: req.params.id,
        userId: req.user!.id,
      });

      res.json({
        success: true,
        data: output,
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * HTTP POST /api/bookings/:id/cancel
   * Cancel a booking
   */
  async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const booking = await this.bookingRepository.findById(req.params.id);

      if (!booking) {
        throw new NotFoundError('Booking', req.params.id);
      }

      // Check authorization
      if (booking.getUserId() !== req.user?.id && req.user?.role !== 'ADMIN') {
        throw new AuthorizationError('You cannot cancel this booking');
      }

      // Cancel and get refund
      const refund = booking.cancel();
      await this.bookingRepository.save(booking);

      res.json({
        success: true,
        data: {
          bookingId: booking.getId(),
          status: booking.getStatus(),
          refund: refund.value,
          message: 'Booking cancelled successfully',
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  // ============ ERROR HANDLING ============

  /**
   * Centralized error handler
   */
  private handleError(error: any, res: Response): void {
    ErrorHandler.log(error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return;
    }

    // Unexpected error
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    });
  }
}
