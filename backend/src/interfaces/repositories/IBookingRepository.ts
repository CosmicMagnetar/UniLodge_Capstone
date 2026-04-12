import { IBooking } from '../../models/Booking';

export interface BookingQueryFilters {
  userId?: string;
  paymentStatus?: string;
  status?: string;
}

export interface MonthlyRevenueResult {
  revenue: number;
}

/**
 * IBookingRepository — Interface Segregation Principle (ISP)
 */
export interface IBookingRepository {
  findAll(filters: BookingQueryFilters): Promise<IBooking[]>;
  findById(id: string): Promise<IBooking | null>;
  findConflicting(roomId: string, checkIn: Date, checkOut: Date): Promise<IBooking | null>;
  create(data: Partial<IBooking>): Promise<IBooking>;
  save(booking: IBooking): Promise<IBooking>;
  countDocuments(filter?: Record<string, any>): Promise<number>;
  aggregateRevenue(matchFilter: Record<string, any>): Promise<number>;
}
