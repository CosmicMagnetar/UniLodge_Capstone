import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { bookingService } from '../container';
import { createBookingSchema, updateBookingStatusSchema, processPaymentSchema } from '../validators/schemas';
import { ValidationError } from '../errors/AppError';

/**
 * BookingController — Thin Controller (SRP)
 * 
 * All business logic is in BookingService. Controller only handles:
 * HTTP request parsing → Zod validation → Service delegation → HTTP response
 */

export const getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bookings = await bookingService.getBookings(
      req.user!.id,
      req.user!.role,
      req.query.paymentStatus as string
    );
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.getBooking(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { roomId, checkInDate, checkOutDate } = parsed.data;
    const booking = await bookingService.createBooking(roomId, checkInDate, checkOutDate, req.user!.id);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateBookingStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const booking = await bookingService.updateStatus(
      req.params.id,
      parsed.data.status,
      req.user!.id,
      req.user!.role
    );
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = processPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const result = await bookingService.processPayment(
      req.params.id,
      req.user!.id,
      parsed.data.paymentMethod
    );
    res.json({ message: 'Payment processed successfully', booking: result });
  } catch (error) {
    next(error);
  }
};

export const completeCheckIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.completeCheckIn(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json({ message: 'Check-in completed', booking: result });
  } catch (error) {
    next(error);
  }
};

export const completeCheckOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.completeCheckOut(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json({ message: 'Check-out completed', booking: result });
  } catch (error) {
    next(error);
  }
};
