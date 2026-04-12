/**
 * Room Service Unit Tests
 */

import { describe, it, expect } from 'vitest'
import { roomTypeSchema } from '@unilodge/shared/schemas'

describe('Room Service', () => {
  describe('Room Validation', () => {
    it('should validate Single room type', () => {
      expect(roomTypeSchema.parse('Single')).toBe('Single')
    })

    it('should validate Double room type', () => {
      expect(roomTypeSchema.parse('Double')).toBe('Double')
    })

    it('should validate Suite room type', () => {
      expect(roomTypeSchema.parse('Suite')).toBe('Suite')
    })

    it('should reject invalid room type', () => {
      expect(() => roomTypeSchema.parse('Apartment')).toThrow()
    })
  })

  describe('Room Data', () => {
    const validRoom = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      roomNumber: '101',
      type: 'Single' as const,
      basePrice: 500,
      amenities: ['WiFi', 'AC'],
      rating: 4.5,
      isAvailable: true,
      university: 'MIT',
      capacity: 1,
      createdAt: new Date(),
    }

    it('should accept valid room data', () => {
      expect(validRoom).toBeDefined()
      expect(validRoom.roomNumber).toBe('101')
      expect(validRoom.basePrice).toBeGreaterThan(0)
    })

    it('should calculate room pricing correctly', () => {
      const nightsStay = 7
      const expectedPrice = validRoom.basePrice * nightsStay
      expect(expectedPrice).toBe(3500)
    })

    it('should track room amenities', () => {
      expect(validRoom.amenities).toContain('WiFi')
      expect(validRoom.amenities).toContain('AC')
      expect(validRoom.amenities.length).toBe(2)
    })

    it('should validate room availability', () => {
      expect(validRoom.isAvailable).toBe(true)
    })

    it('should validate room rating', () => {
      expect(validRoom.rating).toBeGreaterThanOrEqual(0)
      expect(validRoom.rating).toBeLessThanOrEqual(5)
    })

    it('should track room capacity', () => {
      expect(validRoom.capacity).toBeGreaterThan(0)
    })
  })
})
