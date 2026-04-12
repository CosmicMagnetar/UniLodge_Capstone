import { IBookingRepository } from '../interfaces/repositories/IBookingRepository';
import { IRoomRepository } from '../interfaces/repositories/IRoomRepository';

/**
 * AnalyticsService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL analytics/reporting business logic.
 * DIP: Depends on repository interfaces, not Mongoose models.
 */
export class AnalyticsService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  /**
   * Get full analytics dashboard data
   */
  async getAnalytics() {
    // Parallel queries for performance
    const [totalRooms, availableRooms, totalBookings, confirmedBookings, pendingBookings] = await Promise.all([
      this.roomRepository.findAll({}).then(rooms => rooms.length),
      this.roomRepository.findAll({ available: true }).then(rooms => rooms.length),
      this.bookingRepository.countDocuments(),
      this.bookingRepository.countDocuments({ status: 'Confirmed' }),
      this.bookingRepository.countDocuments({ status: 'Pending' }),
    ]);

    // Total revenue from confirmed/completed bookings
    const totalRevenue = await this.bookingRepository.aggregateRevenue({
      status: { $in: ['Confirmed', 'Completed'] },
    });

    const occupancyRate = totalRooms > 0
      ? ((totalRooms - availableRooms) / totalRooms) * 100
      : 0;

    // Monthly revenue for last 6 months
    const monthlyRevenue = await this.getMonthlyRevenue();

    return {
      overview: {
        totalRooms,
        availableRooms,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      },
      monthlyRevenue,
    };
  }

  /**
   * Calculate monthly revenue for the last 6 months
   */
  private async getMonthlyRevenue() {
    const monthlyRevenue = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const revenue = await this.bookingRepository.aggregateRevenue({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: { $in: ['Confirmed', 'Completed'] },
      });

      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue,
      });
    }

    return monthlyRevenue;
  }
}
