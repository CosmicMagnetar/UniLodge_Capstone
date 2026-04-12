/**
 * MongoRoomRepository - Infrastructure Implementation
 */

import { Model } from 'mongoose';
import { Room } from '../domain/entities/Room';
import { Price } from '../domain/value-objects/Price';
import { IRoomRepository } from '../domain/repositories';
import { DatabaseError } from '../shared/errors/AppError';

export class MongoRoomRepository implements IRoomRepository {
  constructor(private roomModel: Model<any>) {}

  async findById(id: string): Promise<Room | null> {
    try {
      const doc = await this.roomModel.findById(id).populate('wardenId', 'name email');
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw new DatabaseError('Failed to find room', { id, error });
    }
  }

  async findByWardenId(wardenId: string): Promise<Room[]> {
    try {
      const docs = await this.roomModel
        .find({ wardenId })
        .sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find rooms by warden', { wardenId, error });
    }
  }

  async findApproved(): Promise<Room[]> {
    try {
      const docs = await this.roomModel
        .find({ isApproved: true, status: 'Available' })
        .sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find approved rooms', { error });
    }
  }

  async findPending(): Promise<Room[]> {
    try {
      const docs = await this.roomModel
        .find({ isApproved: false })
        .sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find pending rooms', { error });
    }
  }

  async findByLocation(location: string): Promise<Room[]> {
    try {
      const docs = await this.roomModel
        .find({ location, isApproved: true })
        .sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find rooms by location', { location, error });
    }
  }

  async search(criteria: any): Promise<Room[]> {
    try {
      const query: any = { isApproved: true };

      if (criteria.location) {
        query.location = new RegExp(criteria.location, 'i');
      }

      if (criteria.minPrice || criteria.maxPrice) {
        query.pricePerNight = {};
        if (criteria.minPrice) query.pricePerNight.$gte = criteria.minPrice;
        if (criteria.maxPrice) query.pricePerNight.$lte = criteria.maxPrice;
      }

      if (criteria.capacity) {
        query.capacity = { $gte: criteria.capacity };
      }

      if (criteria.amenities && criteria.amenities.length > 0) {
        query.amenities = { $all: criteria.amenities };
      }

      const docs = await this.roomModel.find(query).sort({ createdAt: -1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Room search failed', { criteria, error });
    }
  }

  async findAvailable(): Promise<Room[]> {
    try {
      const docs = await this.roomModel
        .find({ isApproved: true, status: 'Available' })
        .sort({ pricePerNight: 1 });
      return docs.map(doc => this.toDomain(doc));
    } catch (error) {
      throw new DatabaseError('Failed to find available rooms', { error });
    }
  }

  async save(room: Room): Promise<void> {
    try {
      const data = this.toPersistence(room);
      await this.roomModel.updateOne(
        { _id: data._id || room.getId() },
        data,
        { upsert: true }
      );
    } catch (error) {
      throw new DatabaseError('Failed to save room', {
        roomId: room.getId(),
        error,
      });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.roomModel.deleteOne({ _id: id });
    } catch (error) {
      throw new DatabaseError('Failed to delete room', { id, error });
    }
  }

  async count(criteria?: any): Promise<number> {
    try {
      return await this.roomModel.countDocuments(criteria || {});
    } catch (error) {
      throw new DatabaseError('Failed to count rooms', { criteria, error });
    }
  }

  private toDomain(doc: any): Room {
    return Room.fromDB({
      _id: doc._id,
      wardenId: doc.wardenId?._id || doc.wardenId,
      name: doc.name,
      description: doc.description,
      pricePerNight: doc.pricePerNight,
      capacity: doc.capacity,
      amenities: doc.amenities,
      images: doc.images,
      location: doc.location,
      status: doc.status,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private toPersistence(room: Room): any {
    return {
      _id: room.getId(),
      wardenId: room.getWardenId(),
      name: room.getName(),
      description: room.getDescription(),
      pricePerNight: room.getPricePerNight().value,
      capacity: room.getCapacity(),
      amenities: room.getAmenities(),
      images: room.getImages(),
      location: room.getLocation(),
      status: room.getStatus(),
      isApproved: room.isApprovedByAdmin(),
      createdAt: room.getCreatedAt(),
      updatedAt: room.getUpdatedAt(),
    };
  }
}
