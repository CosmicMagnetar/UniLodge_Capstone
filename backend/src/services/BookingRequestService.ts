import { IBookingRequestRepository } from '../interfaces/repositories/IBookingRequestRepository';
import { IBookingRepository } from '../interfaces/repositories/IBookingRepository';
import { IRoomRepository } from '../interfaces/repositories/IRoomRepository';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { NotificationFactory } from '../factories/NotificationFactory';
import { NotFoundError, ValidationError, UnauthorizedError } from '../errors/AppError';

/**
 * BookingRequestService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL booking request business logic.
 * DIP: Depends on repository interfaces, not Mongoose models.
 */
export class BookingRequestService {
  constructor(
    private readonly bookingRequestRepository: IBookingRequestRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationFactory: NotificationFactory
  ) {}

  /**
   * Create a booking request (Guest)
   */
  async createRequest(roomId: string, checkInDate: string, checkOutDate: string, message: string, userId: string) {
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const days = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.price * days;

    return this.bookingRequestRepository.create({
      roomId: roomId as any,
      userId: userId as any,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      message,
      totalPrice,
    } as any);
  }

  /**
   * Get all booking requests (Admin)
   */
  async getAllRequests(status?: string) {
    const requests = await this.bookingRequestRepository.findAll({ status });

    return requests.map(r => ({
      id: (r as any)._id.toString(),
      roomId: r.roomId,
      userId: r.userId,
      checkInDate: r.checkInDate,
      checkOutDate: r.checkOutDate,
      status: r.status,
      message: r.message,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt,
      respondedBy: r.respondedBy,
      respondedAt: r.respondedAt,
      room: r.roomId,
    }));
  }

  /**
   * Get user's booking requests (Guest)
   */
  async getUserRequests(userId: string) {
    const requests = await this.bookingRequestRepository.findByUser(userId);

    return requests.map(r => ({
      id: (r as any)._id.toString(),
      roomId: r.roomId,
      userId: r.userId,
      checkInDate: r.checkInDate,
      checkOutDate: r.checkOutDate,
      status: r.status,
      message: r.message,
      totalPrice: r.totalPrice,
      createdAt: r.createdAt,
      room: r.roomId,
    }));
  }

  /**
   * Approve a booking request (Admin)
   */
  async approveRequest(id: string, respondedBy: string) {
    const bookingRequest = await this.bookingRequestRepository.findById(id);
    if (!bookingRequest) {
      throw new NotFoundError('Booking request');
    }

    if (bookingRequest.status !== 'pending') {
      throw new ValidationError('Request already processed');
    }

    const room = await this.roomRepository.findById(bookingRequest.roomId.toString());
    if (!room) {
      throw new NotFoundError('Room');
    }

    const checkIn = new Date(bookingRequest.checkInDate);
    const checkOut = new Date(bookingRequest.checkOutDate);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Create the confirmed booking
    const booking = await this.bookingRepository.create({
      roomId: bookingRequest.roomId,
      userId: bookingRequest.userId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      status: 'Confirmed',
      totalPrice: room.price * days,
      paymentStatus: 'unpaid',
      checkInCompleted: false,
      checkOutCompleted: false,
    } as any);

    // Update request status
    bookingRequest.status = 'approved';
    bookingRequest.respondedAt = new Date();
    bookingRequest.respondedBy = respondedBy as any;
    await this.bookingRequestRepository.save(bookingRequest);

    return { message: 'Booking request approved', booking, request: bookingRequest };
  }

  /**
   * Reject a booking request (Admin) and notify user
   */
  async rejectRequest(id: string, adminId: string) {
    const bookingRequest = await this.bookingRequestRepository.findByIdPopulated(id);
    if (!bookingRequest) {
      throw new NotFoundError('Booking request');
    }

    if (bookingRequest.status !== 'pending') {
      throw new ValidationError('Request already processed');
    }

    const room: any = bookingRequest.roomId;
    const roomTitle = room?.roomNumber || 'the requested room';

    // Create rejection notification
    const notificationData = this.notificationFactory.createRejection(
      bookingRequest.userId,
      'Booking Request Not Approved',
      `Your booking request for ${roomTitle} was not approved. Please try another room or contact support for more information.`,
      id,
      'booking-request',
      7
    );
    await this.notificationRepository.create(notificationData);

    // Update request status
    bookingRequest.status = 'rejected';
    bookingRequest.respondedAt = new Date();
    bookingRequest.respondedBy = adminId as any;
    await this.bookingRequestRepository.save(bookingRequest);

    return {
      message: 'Booking request rejected and notification sent to user',
      request: bookingRequest,
    };
  }
}
