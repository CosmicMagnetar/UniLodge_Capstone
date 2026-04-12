import BookingRequest, { IBookingRequest } from '../models/BookingRequest';
import { IBookingRequestRepository, BookingRequestQueryFilters } from '../interfaces/repositories/IBookingRequestRepository';

/**
 * BookingRequestRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 */
export class BookingRequestRepository implements IBookingRequestRepository {
  async findAll(filters: BookingRequestQueryFilters): Promise<IBookingRequest[]> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    return BookingRequest.find(query)
      .populate('roomId')
      .populate('userId', 'name email')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<IBookingRequest[]> {
    return BookingRequest.find({ userId })
      .populate('roomId')
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IBookingRequest | null> {
    return BookingRequest.findById(id);
  }

  async findByIdPopulated(id: string): Promise<IBookingRequest | null> {
    return BookingRequest.findById(id).populate('roomId');
  }

  async create(data: Partial<IBookingRequest>): Promise<IBookingRequest> {
    const request = new BookingRequest(data);
    await request.save();
    return BookingRequest.findById(request._id)
      .populate('roomId')
      .populate('userId', 'name email') as Promise<IBookingRequest>;
  }

  async save(request: IBookingRequest): Promise<IBookingRequest> {
    await request.save();
    return request;
  }
}
