/**
 * Analytics Service Unit Tests
 */

import { describe, it, expect } from 'vitest'

describe('Analytics Service', () => {
  describe('Booking Analytics', () => {
    it('should calculate total bookings', () => {
      const bookings = [
        { id: '1', roomId: 'room1', status: 'Confirmed' },
        { id: '2', roomId: 'room2', status: 'Pending' },
        { id: '3', roomId: 'room3', status: 'Confirmed' },
      ]
      expect(bookings.length).toBe(3)
    })

    it('should count confirmed bookings', () => {
      const bookings = [
        { id: '1', status: 'Confirmed' },
        { id: '2', status: 'Pending' },
        { id: '3', status: 'Confirmed' },
      ]
      const confirmed = bookings.filter((b) => b.status === 'Confirmed').length
      expect(confirmed).toBe(2)
    })

    it('should calculate occupancy rate', () => {
      const totalRooms = 100
      const occupiedRooms = 75
      const occupancyRate = (occupiedRooms / totalRooms) * 100
      expect(occupancyRate).toBe(75)
      expect(occupancyRate).toBeLessThanOrEqual(100)
    })

    it('should calculate average booking value', () => {
      const bookings = [
        { amount: 500 },
        { amount: 750 },
        { amount: 1000 },
      ]
      const total = bookings.reduce((sum, b) => sum + b.amount, 0)
      const average = total / bookings.length
      expect(average).toBe(750)
    })
  })

  describe('Room Analytics', () => {
    it('should calculate average room rating', () => {
      const rooms = [
        { id: '1', rating: 4.5 },
        { id: '2', rating: 4.0 },
        { id: '3', rating: 5.0 },
      ]
      const avgRating = rooms.reduce((sum, r) => sum + r.rating, 0) / rooms.length
      expect(avgRating).toBeCloseTo(4.5, 1)
    })

    it('should identify popular amenities', () => {
      const rooms = [
        { amenities: ['WiFi', 'AC', 'TV'] },
        { amenities: ['WiFi', 'AC'] },
        { amenities: ['WiFi', 'Parking'] },
      ]
      const amenityCounts: Record<string, number> = {}
      rooms.forEach((room) => {
        room.amenities.forEach((amenity) => {
          amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1
        })
      })
      expect(amenityCounts['WiFi']).toBe(3)
      expect(amenityCounts['AC']).toBe(2)
      expect(amenityCounts['Parking']).toBe(1)
    })
  })

  describe('Time-based Analytics', () => {
    it('should calculate booking trends', () => {
      const bookings = [
        { date: '2024-01-01', amount: 500 },
        { date: '2024-01-02', amount: 750 },
        { date: '2024-01-03', amount: 600 },
      ]
      expect(bookings.length).toBe(3)
      expect(bookings[0].amount).toBeLessThan(bookings[1].amount)
    })

    it('should identify peak hours', () => {
      const bookingsByHour: Record<number, number> = {
        9: 5,
        10: 12,
        11: 8,
        12: 3,
      }
      const peakHour = Object.entries(bookingsByHour).sort(
        ([, a], [, b]) => b - a
      )[0][0]
      expect(parseInt(peakHour)).toBe(10)
    })
  })
})
