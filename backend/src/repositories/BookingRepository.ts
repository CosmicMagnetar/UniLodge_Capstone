import Booking, { IBooking } from '../models/Booking';
import { IBookingRepository, BookingQueryFilters } from '../interfaces/repositories/IBookingRepository';

/**
 * BookingRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 */
export class BookingRepository implements IBookingRepository {
  async findAll(filters: BookingQueryFilters): Promise<IBooking[]> {
    const query: any = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      query.paymentStatus = filters.paymentStatus;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return Booking.find(query)
      .populate('roomId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IBooking | null> {
    return Booking.findById(id)
      .populate('roomId')
      .populate('userId', 'name email');
  }

  async findConflicting(roomId: string, checkIn: Date, checkOut: Date): Promise<IBooking | null> {
    return Booking.findOne({
      roomId,
      status: { $ne: 'Cancelled' },
      $or: [
        { checkInDate: { $lte: checkIn }, checkOutDate: { $gt: checkIn } },
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gte: checkOut } },
        { checkInDate: { $gte: checkIn }, checkOutDate: { $lte: checkOut } },
      ],
    });
  }

  async create(data: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(data);
    await booking.save();
    await booking.populate('roomId');
    return booking;
  }

  async save(booking: IBooking): Promise<IBooking> {
    await booking.save();
    return booking;
  }

  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    return Booking.countDocuments(filter);
  }

  async aggregateRevenue(matchFilter: Record<string, any>): Promise<number> {
    const result = await Booking.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  }
}
