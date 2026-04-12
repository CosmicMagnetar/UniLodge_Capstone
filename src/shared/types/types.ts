
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
}

export interface Booking {
  [x: string]: string | Room | undefined;
  id: string;
  roomId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  paymentStatus?: 'paid' | 'pending' | 'failed';
  room?: Room; // Optional, for easier display
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
