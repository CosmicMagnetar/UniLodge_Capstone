import { z } from 'zod'

export const userRoleSchema = z.enum(['GUEST', 'WARDEN', 'ADMIN'])
export const roomTypeSchema = z.enum(['Single', 'Double', 'Suite'])
export const bookingStatusSchema = z.enum(['Confirmed', 'Pending', 'Cancelled'])

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleSchema.default('GUEST'),
})

export const createBookingSchema = z.object({
  roomId: z.string().uuid(),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
})
