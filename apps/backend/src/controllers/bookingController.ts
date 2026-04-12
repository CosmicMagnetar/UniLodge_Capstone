import { Response } from 'express';
import Booking from '../models/Booking';
import Room from '../models/Room';
import User from '../models/User';
import { AuthRequest } from '../types';

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus } = req.query;
    const query: any = {};

    // If not admin, only show user's bookings
    if (req.user?.role !== 'ADMIN') {
      query.userId = req.user?.id;
    }

    // Add payment status filter if provided
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }

    const bookings = await Booking.find(query)
      .populate('roomId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Filter out bookings where room or user is missing (deleted)
    const validBookings = bookings.filter(b => b.roomId && b.userId);

    res.json(validBookings.map(b => ({
      id: b._id.toString(),
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
      user: req.user?.role === 'ADMIN' ? {
        id: (b.userId as any)._id.toString(),
        name: (b.userId as any).name,
        email: (b.userId as any).email,
      } : undefined,
    })));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('roomId')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    if (req.user?.role !== 'ADMIN' && (booking.userId as any)._id.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: booking._id.toString(),
      roomId: booking.roomId._id.toString(),
      userId: booking.userId._id.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      room: booking.roomId,
      user: req.user?.role === 'ADMIN' ? {
        id: (booking.userId as any)._id.toString(),
        name: (booking.userId as any).name,
        email: (booking.userId as any).email,
      } : undefined,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'Room ID, check-in, and check-out dates are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.isAvailable) {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Check for date conflicts
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $ne: 'Cancelled' },
      $or: [
        {
          checkInDate: { $lte: checkIn },
          checkOutDate: { $gt: checkIn }
        },
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gte: checkOut }
        },
        {
          checkInDate: { $gte: checkIn },
          checkOutDate: { $lte: checkOut }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: 'Room is already booked for these dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const newBooking = new Booking({
      roomId,
      userId: req.user!.id,
      checkInDate,
      checkOutDate,
      status: 'Pending',
      totalPrice,
    });

    await newBooking.save();
    await newBooking.populate('roomId');

    res.status(201).json({
      id: newBooking._id.toString(),
      roomId: newBooking.roomId._id.toString(),
      userId: newBooking.userId.toString(),
      checkInDate: newBooking.checkInDate,
      checkOutDate: newBooking.checkOutDate,
      status: newBooking.status,
      totalPrice: newBooking.totalPrice,
      createdAt: newBooking.createdAt,
      room: newBooking.roomId,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only admin can update status, or users can cancel their own bookings
    if (req.user?.role !== 'ADMIN' && (status !== 'Cancelled' || booking.userId.toString() !== req.user?.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    booking.status = status as any;
    await booking.save();

    await booking.populate('roomId');

    res.json({
      id: booking._id.toString(),
      roomId: booking.roomId._id.toString(),
      userId: booking.userId.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      room: booking.roomId,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process payment (Mock)
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'Only confirmed bookings can be paid' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid' });
    }

    // Mock payment processing
    booking.paymentStatus = 'paid';
    booking.paymentDate = new Date();
    booking.paymentMethod = paymentMethod || 'credit_card';
    booking.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    await booking.save();
    // Removed populate as it's not needed for response and can cause issues with dummy rooms
    // await booking.populate('roomId');

    res.json({
      message: 'Payment processed successfully',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentDate: booking.paymentDate,
        paymentMethod: booking.paymentMethod,
        transactionId: booking.transactionId,
        totalPrice: booking.totalPrice,
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

// Complete check-in
export const completeCheckIn = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization (user or admin/warden)
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'WARDEN' && booking.userId.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Payment required before check-in' });
    }

    if (booking.checkInCompleted) {
      return res.status(400).json({ error: 'Already checked in' });
    }

    booking.checkInCompleted = true;
    booking.checkInTime = new Date();
    await booking.save();

    res.json({
      message: 'Check-in completed',
      booking: {
        id: booking._id.toString(),
        checkInCompleted: booking.checkInCompleted,
        checkInTime: booking.checkInTime,
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Check-in failed' });
  }
};

// Complete check-out
export const completeCheckOut = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization (user or admin/warden)
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'WARDEN' && booking.userId.toString() !== req.user?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!booking.checkInCompleted) {
      return res.status(400).json({ error: 'Must check in before check out' });
    }

    if (booking.checkOutCompleted) {
      return res.status(400).json({ error: 'Already checked out' });
    }

    booking.checkOutCompleted = true;
    booking.checkOutTime = new Date();
    booking.status = 'Completed';
    await booking.save();

    res.json({
      message: 'Check-out completed',
      booking: {
        id: booking._id.toString(),
        checkOutCompleted: booking.checkOutCompleted,
        checkOutTime: booking.checkOutTime,
        status: booking.status,
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Check-out failed' });
  }
};
