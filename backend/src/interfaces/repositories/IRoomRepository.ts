import { IRoom } from '../../models/Room';

export interface RoomQueryFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  search?: string;
  approvalStatus?: string;
}

/**
 * IRoomRepository — Interface Segregation Principle (ISP)
 * Segregated interface for room data access operations.
 */
export interface IRoomRepository {
  findAll(filters: RoomQueryFilters): Promise<IRoom[]>;
  findById(id: string): Promise<IRoom | null>;
  findByRoomNumber(roomNumber: string): Promise<IRoom | null>;
  findPending(): Promise<IRoom[]>;
  create(data: Partial<IRoom>): Promise<IRoom>;
  update(id: string, data: Partial<IRoom>): Promise<IRoom | null>;
  delete(id: string): Promise<IRoom | null>;
}
