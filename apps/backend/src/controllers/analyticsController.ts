import { Response } from 'express';
import { AuthRequest } from '../types';
import Room from '../models/Room';
import Booking from '../models/Booking';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    
    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'Completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const occupancyRate = totalRooms > 0 
      ? ((totalRooms - availableRooms) / totalRooms) * 100 
      : 0;

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const revenueData = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart, $lte: monthEnd },
            status: { $in: ['Confirmed', 'Completed'] }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalPrice' }
          }
        }
      ]);

      monthlyRevenue.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: revenueData.length > 0 ? revenueData[0].revenue : 0,
      });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
