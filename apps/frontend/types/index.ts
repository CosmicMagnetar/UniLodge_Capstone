export enum Role {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
  WARDEN = "WARDEN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
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
  university: string;
  building?: string;
  furnished?: boolean;
  nearCampus?: boolean;
}

export interface Booking {
  [x: string]: any;
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  checkInDate: string;
  checkOutDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'CheckedIn' | 'CheckedOut';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  room?: Room; // Optional, for easier display
  checkInCompleted?: boolean;
  checkOutCompleted?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isLoading?: boolean;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  reasoning: string;
}
