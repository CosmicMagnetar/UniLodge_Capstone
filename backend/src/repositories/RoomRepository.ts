import Room, { IRoom } from '../models/Room';
import { IRoomRepository, RoomQueryFilters } from '../interfaces/repositories/IRoomRepository';

/**
 * RoomRepository — Concrete Mongoose implementation.
 * 
 * Design Patterns: Repository Pattern, DIP, SRP
 * All Mongoose query-building logic is encapsulated here.
 */
export class RoomRepository implements IRoomRepository {
  async findAll(filters: RoomQueryFilters): Promise<IRoom[]> {
    const query: any = {};

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { roomNumber: searchRegex },
        { type: searchRegex },
        { university: searchRegex },
        { description: searchRegex },
      ];
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.available !== undefined) {
      query.isAvailable = filters.available;
    }

    if (filters.approvalStatus) {
      query.approvalStatus = filters.approvalStatus;
    }

    return Room.find(query).sort({ roomNumber: 1 });
  }

  async findById(id: string): Promise<IRoom | null> {
    return Room.findById(id);
  }

  async findByRoomNumber(roomNumber: string): Promise<IRoom | null> {
    return Room.findOne({ roomNumber });
  }

  async findPending(): Promise<IRoom[]> {
    return Room.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 });
  }

  async create(data: Partial<IRoom>): Promise<IRoom> {
    const room = new Room(data);
    await room.save();
    return room;
  }

  async update(id: string, data: Partial<IRoom>): Promise<IRoom | null> {
    return Room.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IRoom | null> {
    return Room.findByIdAndDelete(id);
  }
}
