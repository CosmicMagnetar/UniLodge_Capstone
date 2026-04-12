/**
 * MongoBookingRepository - Infrastructure Implementation
 * Implements IBookingRepository using MongoDB/Mongoose
 * Can be swapped with PostgreSQL implementation without changing business logic
 */

import { Model } from 'mongoose';
import { Booking } from '../domain/entities/Booking';
import { DateRange } from '../domain/value-objects/DateRange';
import { Price } from '../domain/value-objects/Price';
import { IBookingRepository } from '../domain/repositories';
import { DatabaseError } from '../shared/errors/AppError';

/**
 * REPOSITORY IMPLEMENTATION: MongoBookingRepository
 * Concrete implementation of IBookingRepository
 */
export class MongoBookingRepository implements IBookingRepository {
  constructor(private bookingModel: Model<any>) {}

  async findById(id: string): Promise<Booking | null> {
    try {
      const doc = await this.bookingModel
        .findById(id)
        .populate('roomId')
        .populate('userId', 'name email role');

      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new DatabaseError('Failed to find booking', { id, error });
    }
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel
        .find({ userId })
        .populate('roomId')
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find bookings by user', { userId, error });
    }
  }

  async findByRoomId(roomId: string): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel
        .find({ roomId })
        .sort({ checkInDate: 1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find bookings by room', { roomId, error });
    }
  }

  async findOverlapping(roomId: string, dateRange: DateRange): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel.find({
        roomId,
        status: { $in: ['Pending', 'Confirmed'] },
        $or: [
          {
            checkInDate: { $lt: dateRange.checkOut },
            checkOutDate: { $gt: dateRange.checkIn },
          },
        ],
      });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find overlapping bookings', {
        roomId,
        dateRange: dateRange.toString(),
        error,
      });
    }
  }

  async findByStatus(status: string): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel.find({ status }).sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find bookings by status', { status, error });
    }
  }

  async findByWarden(wardenId: string): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel
        .find({})
        .populate({
          path: 'roomId',
          match: { wardenId },
        })
        .exec();

      // Filter out bookings where room doesn't match (populate returns null)
      return docs
        .filter(doc => doc.roomId !== null)
        .map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find bookings by warden', { wardenId, error });
    }
  }

  async findActive(): Promise<Booking[]> {
    try {
      const docs = await this.bookingModel
        .find({
          status: { $in: ['Pending', 'Confirmed'] },
        })
        .sort({ createdAt: -1 });

      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find active bookings', { error });
    }
  }

  async save(booking: Booking): Promise<void> {
    try {
      const data = this.toPersistence(booking);
      await this.bookingModel.updateOne(
        { _id: data._id || booking.getId() },
        data,
        { upsert: true }
      );
    } catch (error) {
      throw new DatabaseError('Failed to save booking', {
        bookingId: booking.getId(),
        error,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.bookingModel.deleteOne({ _id: id });
    } catch (error) {
      throw new DatabaseError('Failed to delete booking', { id, error });
    }
  }

  async count(criteria?: any): Promise<number> {
    try {
      return await this.bookingModel.countDocuments(criteria || {});
    } catch (error) {
      throw new DatabaseError('Failed to count bookings', { criteria, error });
    }
  }

  // ============ MAPPER METHODS ============

  /**
   * Convert MongoDB document to Domain Entity
   */
  private toDomain(doc: any): Booking {
    return Booking.fromDB({
      _id: doc._id,
      roomId: doc.roomId?._id || doc.roomId,
      userId: doc.userId?._id || doc.userId,
      checkInDate: doc.checkInDate,
      checkOutDate: doc.checkOutDate,
      status: doc.status,
      totalPrice: doc.totalPrice,
      paymentStatus: doc.paymentStatus,
      paymentDate: doc.paymentDate,
      paymentMethod: doc.paymentMethod,
      transactionId: doc.transactionId,
      checkInCompleted: doc.checkInCompleted,
      checkOutCompleted: doc.checkOutCompleted,
      checkInTime: doc.checkInTime,
      checkOutTime: doc.checkOutTime,
      createdAt: doc.createdAt,
    });
  }

  /**
   * Convert Domain Entity to MongoDB document
   */
  private toPersistence(booking: Booking): any {
    return {
      _id: booking.getId(),
      roomId: booking.getRoomId(),
      userId: booking.getUserId(),
      checkInDate: booking.getCheckInDate(),
      checkOutDate: booking.getCheckOutDate(),
      status: booking.getStatus(),
      totalPrice: booking.getTotalPrice().value,
      paymentStatus: booking.getPaymentStatus(),
      paymentDate: booking.getPaymentDate?.(),
      paymentMethod: booking.getPaymentMethod?.(),
      transactionId: booking.getTransactionId(),
      checkInCompleted: booking.isCheckInCompleted(),
      checkOutCompleted: booking.isCheckOutCompleted(),
      checkInTime: booking.getCheckInTime?.(),
      checkOutTime: booking.getCheckOutTime?.(),
      createdAt: booking.getCreatedAt(),
    };
  }
}
