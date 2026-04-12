import { IBookingRepository } from '../interfaces/repositories/IBookingRepository';
import { IRoomRepository } from '../interfaces/repositories/IRoomRepository';
import { NotFoundError, ValidationError, ForbiddenError } from '../errors/AppError';

/**
 * BookingService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL booking business logic (CRUD, payments, check-in/out).
 * DIP: Depends on repository interfaces, not Mongoose models.
 */
export class BookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  /**
   * Get bookings (admin sees all, guests see own)
   */
  async getBookings(userId: string, userRole: string, paymentStatus?: string) {
    const filters: any = {};

    if (userRole !== 'ADMIN') {
      filters.userId = userId;
    }

    if (paymentStatus) {
      filters.paymentStatus = paymentStatus;
    }

    const bookings = await this.bookingRepository.findAll(filters);

    // Filter out bookings where room or user is missing (deleted)
    const validBookings = bookings.filter(b => b.roomId && b.userId);

    return validBookings.map(b => ({
      id: (b as any)._id.toString(),
      roomId: (b.roomId as any)._id.toString(),
      userId: (b.userId as any)._id.toString(),
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      status: b.status,
      totalPrice: b.totalPrice,
      createdAt: b.createdAt,
      room: b.roomId,
      paymentStatus: b.paymentStatus || 'pending',
      paymentDate: b.paymentDate,
      paymentMethod: b.paymentMethod,
      transactionId: b.transactionId,
      checkInCompleted: b.checkInCompleted || false,
      checkOutCompleted: b.checkOutCompleted || false,
      user: userRole === 'ADMIN' ? {
        id: (b.userId as any)._id.toString(),
        name: (b.userId as any).name,
        email: (b.userId as any).email,
      } : undefined,
    }));
  }

  /**
   * Get a single booking
   */
  async getBooking(id: string, userId: string, userRole: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Authorization check
    if (userRole !== 'ADMIN' && (booking.userId as any)._id.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return {
      id: (booking as any)._id.toString(),
      roomId: (booking.roomId as any)._id.toString(),
      userId: (booking.userId as any)._id.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      room: booking.roomId,
      user: userRole === 'ADMIN' ? {
        id: (booking.userId as any)._id.toString(),
        name: (booking.userId as any).name,
        email: (booking.userId as any).email,
      } : undefined,
    };
  }

  /**
   * Create a new booking with conflict checking and price calculation
   */
  async createBooking(roomId: string, checkInDate: string, checkOutDate: string, userId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    if (!room.isAvailable) {
      throw new ValidationError('Room is not available');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      throw new ValidationError('Check-out date must be after check-in date');
    }

    // Check for conflicting bookings
    const conflicting = await this.bookingRepository.findConflicting(roomId, checkIn, checkOut);
    if (conflicting) {
      throw new ValidationError('Room is already booked for these dates');
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const newBooking = await this.bookingRepository.create({
      roomId: roomId as any,
      userId: userId as any,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      status: 'Pending',
      totalPrice,
    } as any);

    return {
      id: (newBooking as any)._id.toString(),
      roomId: (newBooking.roomId as any)._id?.toString() || newBooking.roomId.toString(),
      userId: newBooking.userId.toString(),
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      status: newBooking.status,
      totalPrice: newBooking.totalPrice,
      createdAt: newBooking.createdAt,
      room: newBooking.roomId,
    };
  }

  /**
   * Update booking status (admin or user cancelling own)
   */
  async updateStatus(id: string, status: string, userId: string, userRole: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Only admin can update status, or users can cancel their own bookings
    if (userRole !== 'ADMIN' && (status !== 'Cancelled' || booking.userId.toString() !== userId)) {
      throw new ForbiddenError('Access denied');
    }

    booking.status = status as any;
    await this.bookingRepository.save(booking);
    await (booking as any).populate('roomId');

    return {
      id: (booking as any)._id.toString(),
      roomId: (booking.roomId as any)._id.toString(),
      userId: booking.userId.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      room: booking.roomId,
    };
  }

  /**
   * Process a mock payment
   */
  async processPayment(id: string, userId: string, paymentMethod: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'Confirmed') {
      throw new ValidationError('Only confirmed bookings can be paid');
    }

    if (booking.paymentStatus === 'paid') {
      throw new ValidationError('Booking is already paid');
    }

    booking.paymentStatus = 'paid';
    booking.paymentDate = new Date();
    booking.paymentMethod = paymentMethod || 'credit_card';
    booking.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await this.bookingRepository.save(booking);

    return {
      id: (booking as any)._id.toString(),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentDate: booking.paymentDate,
      paymentMethod: booking.paymentMethod,
      transactionId: booking.transactionId,
      totalPrice: booking.totalPrice,
    };
  }

  /**
   * Complete check-in
   */
  async completeCheckIn(id: string, userId: string, userRole: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    if (userRole !== 'ADMIN' && userRole !== 'WARDEN' && booking.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.paymentStatus !== 'paid') {
      throw new ValidationError('Payment required before check-in');
    }

    if (booking.checkInCompleted) {
      throw new ValidationError('Already checked in');
    }

    booking.checkInCompleted = true;
    booking.checkInTime = new Date();
    await this.bookingRepository.save(booking);

    return {
      id: (booking as any)._id.toString(),
      checkInCompleted: booking.checkInCompleted,
      checkInTime: booking.checkInTime,
    };
  }

  /**
   * Complete check-out
   */
  async completeCheckOut(id: string, userId: string, userRole: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    if (userRole !== 'ADMIN' && userRole !== 'WARDEN' && booking.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (!booking.checkInCompleted) {
      throw new ValidationError('Must check in before check out');
    }

    if (booking.checkOutCompleted) {
      throw new ValidationError('Already checked out');
    }

    booking.checkOutCompleted = true;
    booking.checkOutTime = new Date();
    booking.status = 'Completed';
    await this.bookingRepository.save(booking);

    return {
      id: (booking as any)._id.toString(),
      checkOutCompleted: booking.checkOutCompleted,
      checkOutTime: booking.checkOutTime,
      status: booking.status,
    };
  }
}
