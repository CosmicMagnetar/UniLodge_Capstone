import { IRoomRepository } from '../interfaces/repositories/IRoomRepository';
import { IReviewRepository } from '../interfaces/repositories/IReviewRepository';
import { INotificationRepository } from '../interfaces/repositories/INotificationRepository';
import { NotificationFactory } from '../factories/NotificationFactory';
import { NotFoundError, ConflictError, ValidationError } from '../errors/AppError';
import { CreateRoomInput } from '../validators/schemas';

/**
 * RoomService — Service Layer (SRP)
 * 
 * Single Responsibility: ALL room business logic.
 * DIP: Depends on repository interfaces, not Mongoose models.
 */
export class RoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly reviewRepository: IReviewRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly notificationFactory: NotificationFactory
  ) {}

  /**
   * Get all rooms with optional filters
   */
  async getRooms(filters: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    search?: string;
  }) {
    return this.roomRepository.findAll(filters);
  }

  /**
   * Get a single room with reviews and computed average rating
   */
  async getRoomById(id: string) {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const reviews = await this.reviewRepository.findByRoom(id);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : room.rating;

    return {
      ...room.toObject(),
      rating: avgRating,
      reviews: reviews.map(r => ({
        id: (r as any)._id.toString(),
        rating: r.rating,
        comment: r.comment,
        user: r.userId,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Create a new room
   */
  async createRoom(data: CreateRoomInput) {
    const existingRoom = await this.roomRepository.findByRoomNumber(data.roomNumber);
    if (existingRoom) {
      throw new ConflictError('Room number already exists');
    }

    return this.roomRepository.create({
      ...data,
      price: Number(data.price),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
      rating: 0,
      isAvailable: true,
      approvalStatus: 'pending',
    } as any);
  }

  /**
   * Update a room
   */
  async updateRoom(id: string, data: Record<string, any>) {
    const updatedRoom = await this.roomRepository.update(id, data);
    if (!updatedRoom) {
      throw new NotFoundError('Room');
    }
    return updatedRoom;
  }

  /**
   * Delete a room
   */
  async deleteRoom(id: string) {
    const room = await this.roomRepository.delete(id);
    if (!room) {
      throw new NotFoundError('Room');
    }
  }

  /**
   * Approve a room listing
   */
  async approveRoom(id: string, userId: string) {
    const room = await this.roomRepository.update(id, {
      approvalStatus: 'approved',
      wardenId: userId as any,
    });

    if (!room) {
      throw new NotFoundError('Room');
    }

    return room;
  }

  /**
   * Reject a room listing and notify the warden
   */
  async rejectRoom(id: string) {
    const room = await this.roomRepository.findById(id);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const roomTitle = `Room ${room.roomNumber}`;
    const wardenId = room.wardenId;

    // Create rejection notification for the warden
    if (wardenId) {
      const notificationData = this.notificationFactory.createRejection(
        wardenId,
        'Room Listing Not Approved',
        `Your room listing "${roomTitle}" was not approved. Please review our listing guidelines and try again, or contact support for more information.`,
        id,
        'room',
        7
      );
      await this.notificationRepository.create(notificationData);
    }

    // Delete the rejected room
    await this.roomRepository.delete(id);

    return { message: 'Room rejected and notification sent to warden', deleted: true };
  }

  /**
   * Get all pending rooms (awaiting approval)
   */
  async getPendingRooms() {
    return this.roomRepository.findPending();
  }
}
