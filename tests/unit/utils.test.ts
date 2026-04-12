import { describe, it, expect } from 'vitest'

describe('Frontend Utils', () => {
  describe('Room Price Formatting', () => {
    it('should format price as currency', () => {
      const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price)

      expect(formatPrice(500)).toContain('$')
      expect(formatPrice(500)).toContain('500')
    })

    it('should handle decimal prices', () => {
      const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(price)

      expect(formatPrice(99.99)).toContain('99.99')
    })
  })

  describe('Date Formatting', () => {
    it('should format date for display', () => {
      const date = new Date('2024-06-01')
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      expect(formatted).toContain('June')
      expect(formatted).toContain('2024')
    })

    it('should calculate night count', () => {
      const checkIn = new Date('2024-06-01')
      const checkOut = new Date('2024-06-07')
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(nights).toBe(6)
    })
  })

  describe('Search and Filter', () => {
    const rooms = [
      { id: '1', type: 'Single', price: 500 },
      { id: '2', type: 'Double', price: 750 },
      { id: '3', type: 'Single', price: 600 },
    ]

    it('should filter by room type', () => {
      const filtered = rooms.filter((r) => r.type === 'Single')
      expect(filtered).toHaveLength(2)
      expect(filtered[0].type).toBe('Single')
    })

    it('should filter by price range', () => {
      const minPrice = 500
      const maxPrice = 700
      const filtered = rooms.filter((r) => r.price >= minPrice && r.price <= maxPrice)
      expect(filtered).toHaveLength(2)
    })

    it('should sort by price', () => {
      const sorted = [...rooms].sort((a, b) => a.price - b.price)
      expect(sorted[0].price).toBeLessThanOrEqual(sorted[1].price)
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email: string) =>
        /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)

      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
    })

    it('should validate password strength', () => {
      const validatePassword = (pwd: string) => pwd.length >= 8

      expect(validatePassword('ShortPwd')).toBe(true)
      expect(validatePassword('short')).toBe(false)
    })

    it('should validate required fields', () => {
      const validateRequired = (field: string) => field.trim().length > 0

      expect(validateRequired('valid input')).toBe(true)
      expect(validateRequired('')).toBe(false)
    })
  })
})
