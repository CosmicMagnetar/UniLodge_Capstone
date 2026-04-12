import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { bookingRequestService } from '../container';
import { createBookingRequestSchema } from '../validators/schemas';
import { ValidationError } from '../errors/AppError';

/**
 * BookingRequestController — Thin Controller (SRP)
 */

export const createBookingRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createBookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const { roomId, checkInDate, checkOutDate, message } = parsed.data;
    const result = await bookingRequestService.createRequest(
      roomId, checkInDate, checkOutDate, message, req.user!.id
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAllBookingRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await bookingRequestService.getAllRequests(req.query.status as string);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getUserBookingRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const requests = await bookingRequestService.getUserRequests(req.user!.id);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const approveBookingRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingRequestService.approveRequest(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectBookingRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await bookingRequestService.rejectRequest(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
