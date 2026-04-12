import { IBookingRequest } from '../../models/BookingRequest';

export interface BookingRequestQueryFilters {
  status?: string;
  userId?: string;
}

/**
 * IBookingRequestRepository — Interface Segregation Principle (ISP)
 */
export interface IBookingRequestRepository {
  findAll(filters: BookingRequestQueryFilters): Promise<IBookingRequest[]>;
  findByUser(userId: string): Promise<IBookingRequest[]>;
  findById(id: string): Promise<IBookingRequest | null>;
  findByIdPopulated(id: string): Promise<IBookingRequest | null>;
  create(data: Partial<IBookingRequest>): Promise<IBookingRequest>;
  save(request: IBookingRequest): Promise<IBookingRequest>;
}
