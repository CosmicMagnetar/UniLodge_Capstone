import { IUser } from '../../models/User';

/**
 * IUserRepository — Interface Segregation Principle (ISP)
 * Only exposes the data-access methods needed by consumers.
 * Concrete implementations (Mongoose, SQL, etc.) fulfill this contract.
 */
export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
  create(data: { name: string; email: string; password: string; role: string }): Promise<IUser>;
}
