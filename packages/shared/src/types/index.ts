// User types
export type UserRole = 'GUEST' | 'WARDEN' | 'ADMIN'

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: Date
}

// Room types
export type RoomType = 'Single' | 'Double' | 'Suite'

export interface Room {
  id: string
  roomNumber: string
  type: RoomType
  basePrice: number
  amenities: string[]
  rating: number
  imageUrl?: string
  isAvailable: boolean
  university: string
  description?: string
  capacity: number
  createdAt: Date
}

// Booking types
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled'
export type PaymentStatus = 'paid' | 'pending' | 'failed'

export interface Booking {
  id: string
  roomId: string
  userId: string
  checkInDate: Date
  checkOutDate: Date
  status: BookingStatus
  paymentStatus: PaymentStatus
  totalPrice: number
  createdAt: Date
}
