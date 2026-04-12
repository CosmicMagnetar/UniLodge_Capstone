export enum Role {
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  WARDEN = 'WARDEN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  createdAt: string;
}

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

import { Request } from 'express';

export interface AuthRequest extends Request {
  body: any;
  user?: User;
  cookies: any;
}
