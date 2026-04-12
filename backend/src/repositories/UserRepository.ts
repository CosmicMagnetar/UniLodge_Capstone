import User, { IUser } from '../models/User';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';

/**
 * UserRepository — Concrete Mongoose implementation of IUserRepository.
 * 
 * Design Patterns Applied:
 * - Repository Pattern: Encapsulates all User data-access logic
 * - DIP: Business logic depends on IUserRepository interface, not this class
 * - SRP: This class has ONE job — User data persistence
 */
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-password');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByRole(role: string): Promise<IUser[]> {
    return User.find({ role }).select('-password');
  }

  async create(data: { name: string; email: string; password: string; role: string }): Promise<IUser> {
    const user = new User(data);
    await user.save();
    return user;
  }
}
