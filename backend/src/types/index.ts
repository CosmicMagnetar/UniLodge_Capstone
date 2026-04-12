import { Request } from 'express';

/**
 * Types — Refactored with ISP (Interface Segregation Principle)
 * 
 * Instead of a single monolithic interface, we have specific interfaces
 * so consumers only depend on what they actually need.
 */

// ═══════════════════════════════════════
// Role Enum
// ═══════════════════════════════════════

export enum Role {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  WARDEN = 'WARDEN',
}

// ═══════════════════════════════════════
// ISP-Compliant User Interfaces
// ═══════════════════════════════════════

/** Minimal user identity — used by middleware and authorization */
export interface UserIdentity {
  id: string;
  role: Role | string;
}

/** User profile — used by profile endpoints */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role | string;
  createdAt: string;
}

/** Full user — used internally by auth services */
export interface User extends UserProfile {
  password?: string;
}

// ═══════════════════════════════════════
// ISP-Compliant Request Interfaces
// ═══════════════════════════════════════

/** Authenticated request — carries user info from auth middleware */
export interface AuthRequest extends Request {
  user?: User;
  cookies: any;
}

// ═══════════════════════════════════════
// Domain Types
// ═══════════════════════════════════════

export interface Room {
  id: string;
  roomNumber: string;
  type: 'Single' | 'Double' | 'Suite';
  price: number;
  amenities: string[];
  rating: number;
  imageUrl: string;
  isAvailable: boolean;
  description?: string;
  capacity: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  totalPrice: number;
  createdAt: string;
  room?: Room;
  user?: User;
}

export interface Review {
  id: string;
  bookingId: string;
  roomId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}
