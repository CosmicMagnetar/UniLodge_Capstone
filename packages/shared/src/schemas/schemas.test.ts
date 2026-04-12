import { describe, it, expect } from 'vitest'
import {
  userRoleSchema,
  roomTypeSchema,
  bookingStatusSchema,
  loginSchema,
  signupSchema,
  createBookingSchema,
} from '../schemas'

describe('Shared Schemas Validation', () => {
  describe('userRoleSchema', () => {
    it('should accept valid roles', () => {
      expect(userRoleSchema.parse('GUEST')).toBe('GUEST')
      expect(userRoleSchema.parse('WARDEN')).toBe('WARDEN')
      expect(userRoleSchema.parse('ADMIN')).toBe('ADMIN')
    })

    it('should reject invalid roles', () => {
      expect(() => userRoleSchema.parse('INVALID')).toThrow()
    })
  })

  describe('roomTypeSchema', () => {
    it('should accept valid room types', () => {
      expect(roomTypeSchema.parse('Single')).toBe('Single')
      expect(roomTypeSchema.parse('Double')).toBe('Double')
      expect(roomTypeSchema.parse('Suite')).toBe('Suite')
    })

    it('should reject invalid room types', () => {
      expect(() => roomTypeSchema.parse('Penthouse')).toThrow()
    })
  })

  describe('bookingStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(bookingStatusSchema.parse('Confirmed')).toBe('Confirmed')
      expect(bookingStatusSchema.parse('Pending')).toBe('Pending')
      expect(bookingStatusSchema.parse('Cancelled')).toBe('Cancelled')
    })

    it('should reject invalid statuses', () => {
      expect(() => bookingStatusSchema.parse('Booked')).toThrow()
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const input = {
        email: 'user@example.com',
        password: 'validpassword',
      }
      expect(loginSchema.parse(input)).toEqual(input)
    })

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'validpassword',
      }
      expect(() => loginSchema.parse(input)).toThrow()
    })

    it('should reject short password', () => {
      const input = {
        email: 'user@example.com',
        password: 'short',
      }
      expect(() => loginSchema.parse(input)).toThrow()
    })
  })

  describe('signupSchema', () => {
    it('should accept valid signup data with explicit role', () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        role: 'GUEST',
      }
      expect(signupSchema.parse(input)).toEqual(input)
    })

    it('should default to GUEST role when not provided', () => {
      const input = {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'SecurePass123',
      }
      const result = signupSchema.parse(input)
      expect(result.role).toBe('GUEST')
    })

    it('should reject short names', () => {
      const input = {
        fullName: 'J',
        email: 'john@example.com',
        password: 'SecurePass123',
      }
      expect(() => signupSchema.parse(input)).toThrow()
    })

    it('should reject invalid email', () => {
      const input = {
        fullName: 'John Doe',
        email: 'not-an-email',
        password: 'SecurePass123',
      }
      expect(() => signupSchema.parse(input)).toThrow()
    })

    it('should reject short passwords', () => {
      const input = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'Short1',
      }
      expect(() => signupSchema.parse(input)).toThrow()
    })
  })

  describe('createBookingSchema', () => {
    it('should accept valid booking data', () => {
      const input = {
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-07',
      }
      const result = createBookingSchema.parse(input)
      expect(result.roomId).toBe(input.roomId)
    })

    it('should reject invalid room UUID', () => {
      const input = {
        roomId: 'not-a-uuid',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-07',
      }
      expect(() => createBookingSchema.parse(input)).toThrow()
    })

    it('should coerce string dates to Date objects', () => {
      const input = {
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-07',
      }
      const result = createBookingSchema.parse(input)
      expect(result.checkInDate).toBeInstanceOf(Date)
      expect(result.checkOutDate).toBeInstanceOf(Date)
    })

    it('should accept Date objects directly', () => {
      const input = {
        roomId: '550e8400-e29b-41d4-a716-446655440000',
        checkInDate: new Date('2024-06-01'),
        checkOutDate: new Date('2024-06-07'),
      }
      const result = createBookingSchema.parse(input)
      expect(result.checkInDate).toBeInstanceOf(Date)
    })
  })
})
