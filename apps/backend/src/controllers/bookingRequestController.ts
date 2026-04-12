import { Response } from 'express';
import BookingRequest from '../models/BookingRequest';
import Booking from '../models/Booking';
import Room from '../models/Room';
import { AuthRequest } from '../types';
import { createNotification } from './notificationController';

// Create booking request (Guest)
export const createBookingRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { roomId, checkInDate, checkOutDate, message } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if room exists
        let room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Calculate total price
        const days = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = room.price * days;

        const bookingRequest = new BookingRequest({
            roomId,
            userId,
            checkInDate,
            checkOutDate,
            message,
            totalPrice,
        });

        await bookingRequest.save();

        const populatedRequest = await BookingRequest.findById(bookingRequest._id)
            .populate('roomId')
            .populate('userId', 'name email');

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Create booking request error:', error);
        res.status(500).json({ error: 'Failed to create booking request' });
    }
};

// Get all booking requests (Admin)
export const getAllBookingRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;
        const filter: any = {};

        if (status) {
            filter.status = status;
        }

        const requests = await BookingRequest.find(filter)
            .populate('roomId')
            .populate('userId', 'name email')
            .populate('respondedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(requests.map(r => ({
            id: r._id.toString(),
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
            // Include room details if populated
            room: r.roomId
        })));
    } catch (error) {
        console.error('Get booking requests error:', error);
        res.status(500).json({ error: 'Failed to get booking requests' });
    }
};

// Get user's booking requests (Guest)
export const getUserBookingRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const requests = await BookingRequest.find({ userId })
            .populate('roomId')
            .sort({ createdAt: -1 });

        res.json(requests.map(r => ({
            id: r._id.toString(),
            roomId: r.roomId,
            userId: r.userId,
            checkInDate: r.checkInDate,
            checkOutDate: r.checkOutDate,
            status: r.status,
            message: r.message,
            totalPrice: r.totalPrice,
            createdAt: r.createdAt,
            // Include room details if populated
            room: r.roomId
        })));
    } catch (error) {
        console.error('Get user booking requests error:', error);
        res.status(500).json({ error: 'Failed to get booking requests' });
    }
};

// Approve booking request (Admin)
export const approveBookingRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const respondedBy = req.user?.id;

        // Fetch WITHOUT populating roomId first, to preserve the ID even if room doesn't exist
        const bookingRequest = await BookingRequest.findById(id);

        if (!bookingRequest) {
            return res.status(404).json({ error: 'Booking request not found' });
        }

        if (bookingRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Manually find the room to get price
        let room = await Room.findById(bookingRequest.roomId);

        // Handle missing rooms
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Ensure dates are valid Date objects
        const checkIn = new Date(bookingRequest.checkInDate);
        const checkOut = new Date(bookingRequest.checkOutDate);

        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        const booking = new Booking({
            roomId: bookingRequest.roomId, // This is now the ID, preserved!
            userId: bookingRequest.userId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            status: 'Confirmed',
            totalPrice: room.price * days,
            paymentStatus: 'unpaid',
            checkInCompleted: false,
            checkOutCompleted: false,
        });

        await booking.save();

        // Update request status
        bookingRequest.status = 'approved';
        bookingRequest.respondedAt = new Date();
        bookingRequest.respondedBy = respondedBy as any;
        await bookingRequest.save();

        res.json({ message: 'Booking request approved', booking, request: bookingRequest });
    } catch (error) {
        console.error('Approve booking request error:', error);
        res.status(500).json({ error: 'Failed to approve booking request' });
    }
};

// Reject booking request (Admin)
export const rejectBookingRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = req.user?.id;

        const bookingRequest = await BookingRequest.findById(id).populate('roomId');
        if (!bookingRequest) {
            return res.status(404).json({ error: 'Booking request not found' });
        }

        if (bookingRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        const room: any = bookingRequest.roomId;
        const roomTitle = room?.roomNumber || 'the requested room';

        // Create notification for the user
        await createNotification(
            bookingRequest.userId,
            'rejection',
            'Booking Request Not Approved',
            `Your booking request for ${roomTitle} was not approved. Please try another room or contact support for more information.`,
            id,
            'booking-request',
            7 // Expires in 7 days
        );

        // Update request status to rejected
        bookingRequest.status = 'rejected';
        bookingRequest.respondedAt = new Date();
        bookingRequest.respondedBy = adminId as any;
        await bookingRequest.save();

        res.json({
            message: 'Booking request rejected and notification sent to user',
            request: bookingRequest
        });
    } catch (error) {
        console.error('Reject booking request error:', error);
        res.status(500).json({ error: 'Failed to reject booking request' });
    }
};
