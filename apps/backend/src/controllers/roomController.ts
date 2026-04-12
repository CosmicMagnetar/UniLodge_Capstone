import { Request, Response } from 'express';
import Room from '../models/Room';
import { createNotification } from './notificationController';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { type, minPrice, maxPrice, available, search } = req.query;

    const query: any = {};

    // Search functionality - search across multiple fields
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { roomNumber: searchRegex },
        { type: searchRegex },
        { university: searchRegex },
        { description: searchRegex }
      ];
    }

    if (type) {
      query.type = type;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const rooms = await Room.find(query).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get reviews for this room
    const Review = (await import('../models/Review')).default;
    const reviews = await Review.find({ roomId: id }).populate('userId', 'name');

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : room.rating;

    res.json({
      ...room.toObject(),
      rating: avgRating,
      reviews: reviews.map(r => ({
        id: r._id.toString(),
        rating: r.rating,
        comment: r.comment,
        user: r.userId,
        createdAt: r.createdAt,
      }))
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { roomNumber, type, price, amenities, description, capacity, imageUrl } = req.body;

    if (!roomNumber || !type || !price) {
      return res.status(400).json({ error: 'Room number, type, and price are required' });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(409).json({ error: 'Room number already exists' });
    }

    const newRoom = new Room({
      roomNumber,
      type,
      price: Number(price),
      amenities: amenities || [],
      description: description || '',
      capacity: capacity || 1,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
      rating: 0,
      isAvailable: true,
      approvalStatus: 'pending',
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error: any) {
    console.error('Create room error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(updatedRoom);
  } catch (error: any) {
    console.error('Update room error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const room = await Room.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        wardenId: userId
      },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room approved successfully', room });
  } catch (error) {
    console.error('Approve room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const room = await Room.findById(id).populate('wardenId');

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const roomTitle = `Room ${room.roomNumber}`;
    const wardenId = room.wardenId;

    // Create notification for the warden
    if (wardenId) {
      await createNotification(
        wardenId,
        'rejection',
        'Room Listing Not Approved',
        `Your room listing "${roomTitle}" was not approved. Please review our listing guidelines and try again, or contact support for more information.`,
        id,
        'room',
        7 // Expires in 7 days
      );
    }

    // Delete the room from database
    await Room.findByIdAndDelete(id);

    res.json({
      message: 'Room rejected and notification sent to warden',
      deleted: true
    });
  } catch (error) {
    console.error('Reject room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPendingRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error('Get pending rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
