/**
 * MongoUserRepository - Infrastructure Implementation
 */

import { Model } from 'mongoose';
import { IUserRepository } from '../domain/repositories';
import { DatabaseError } from '../shared/errors/AppError';

export class MongoUserRepository implements IUserRepository {
  constructor(private userModel: Model<any>) {}

  async findById(id: string): Promise<any | null> {
    try {
      const doc = await this.userModel.findById(id);
      return doc?.toObject() || null;
    } catch (error) {
      throw new DatabaseError('Failed to find user', { id, error });
    }
  }

  async findByEmail(email: string): Promise<any | null> {
    try {
      const doc = await this.userModel.findOne({ email });
      return doc?.toObject() || null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by email', { email, error });
    }
  }

  async save(user: any): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: user._id || user.id },
        user,
        { upsert: true }
      );
    } catch (error) {
      throw new DatabaseError('Failed to save user', { userId: user._id, error });
    }
  }

  async update(id: string, updates: any): Promise<void> {
    try {
      await this.userModel.updateOne({ _id: id }, { $set: updates });
    } catch (error) {
      throw new DatabaseError('Failed to update user', { id, error });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userModel.deleteOne({ _id: id });
    } catch (error) {
      throw new DatabaseError('Failed to delete user', { id, error });
    }
  }

  async findAllWardens(): Promise<any[]> {
    try {
      const docs = await this.userModel.find({ role: 'WARDEN' });
      return docs.map(d => d.toObject());
    } catch (error) {
      throw new DatabaseError('Failed to find wardens', { error });
    }
  }

  async findAllGuests(): Promise<any[]> {
    try {
      const docs = await this.userModel.find({ role: 'GUEST' });
      return docs.map(d => d.toObject());
    } catch (error) {
      throw new DatabaseError('Failed to find guests', { error });
    }
  }
}
