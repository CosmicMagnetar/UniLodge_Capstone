/**
 * Repository Interfaces (Abstractions)
 * DIP: Depend on these interfaces, not concrete implementations
 */

import { Booking } from '../entities/Booking';
import { Room } from '../entities/Room';
import { DateRange } from '../value-objects/DateRange';

/**
 * INTERFACE: IBookingRepository
 * Abstraction for booking persistence
 * Implemented by MongoDB, PostgreSQL, etc.
 */
export interface IBookingRepository {
  /**
   * Find booking by ID
   */
  findById(id: string): Promise<Booking | null>;

  /**
   * Find all bookings for a user
   */
  findByUserId(userId: string): Promise<Booking[]>;

  /**
   * Find all bookings for a room
   */
  findByRoomId(roomId: string): Promise<Booking[]>;

  /**
   * Find overlapping bookings for a room in given date range
   * OCP: Easy to add new filter methods
   */
  findOverlapping(roomId: string, dateRange: DateRange): Promise<Booking[]>;

  /**
   * Find bookings by status
   */
  findByStatus(status: string): Promise<Booking[]>;

  /**
   * Find bookings for a specific warden (all rooms owned by warden)
   */
  findByWarden(wardenId: string): Promise<Booking[]>;

  /**
   * Find all pending or confirmed bookings
   */
  findActive(): Promise<Booking[]>;

  /**
   * Save new or update existing booking
   */
  save(booking: Booking): Promise<void>;

  /**
   * Delete booking
   */
  delete(id: string): Promise<void>;

  /**
   * Count bookings matching criteria
   */
  count(criteria?: any): Promise<number>;
}

/**
 * INTERFACE: IRoomRepository
 * Abstraction for room persistence
 */
export interface IRoomRepository {
  /**
   * Find room by ID
   */
  findById(id: string): Promise<Room | null>;

  /**
   * Find all rooms created by a warden
   */
  findByWardenId(wardenId: string): Promise<Room[]>;

  /**
   * Find all approved rooms
   */
  findApproved(): Promise<Room[]>;

  /**
   * Find all pending rooms (not approved)
   */
  findPending(): Promise<Room[]>;

  /**
   * Find rooms by location
   */
  findByLocation(location: string): Promise<Room[]>;

  /**
   * Search rooms with filters
   */
  search(criteria: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    amenities?: string[];
  }): Promise<Room[]>;

  /**
   * Find available rooms
   */
  findAvailable(): Promise<Room[]>;

  /**
   * Save room
   */
  save(room: Room): Promise<void>;

  /**
   * Delete room
   */
  delete(id: string): Promise<void>;

  /**
   * Count rooms
   */
  count(criteria?: any): Promise<number>;
}

/**
 * INTERFACE: IUserRepository
 * Abstraction for user persistence
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<any | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<any | null>;

  /**
   * Save user
   */
  save(user: any): Promise<void>;

  /**
   * Update user
   */
  update(id: string, updates: any): Promise<void>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Find all wardens
   */
  findAllWardens(): Promise<any[]>;

  /**
   * Find all guests
   */
  findAllGuests(): Promise<any[]>;
}

/**
 * INTERFACE: INotificationRepository
 * Abstraction for notification persistence
 */
export interface INotificationRepository {
  /**
   * Save notification
   */
  save(notification: any): Promise<void>;

  /**
   * Find notifications for user
   */
  findByUserId(userId: string): Promise<any[]>;

  /**
   * Mark as read
   */
  markAsRead(id: string): Promise<void>;

  /**
   * Delete notification
   */
  delete(id: string): Promise<void>;
}

/**
 * INTERFACE: IBookingRequestRepository
 * Abstraction for booking request persistence
 */
export interface IBookingRequestRepository {
  /**
   * Save booking request
   */
  save(request: any): Promise<void>;

  /**
   * Find by ID
   */
  findById(id: string): Promise<any | null>;

  /**
   * Find by warden
   */
  findByWarden(wardenId: string): Promise<any[]>;

  /**
   * Find by guest
   */
  findByGuest(guestId: string): Promise<any[]>;

  /**
   * Find by status
   */
  findByStatus(status: string): Promise<any[]>;

  /**
   * Update request
   */
  update(id: string, updates: any): Promise<void>;
}
