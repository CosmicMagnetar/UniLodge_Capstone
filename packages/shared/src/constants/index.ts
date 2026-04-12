export const ROLES = {
  GUEST: 'GUEST',
  WARDEN: 'WARDEN',
  ADMIN: 'ADMIN',
} as const

export const ROOM_TYPES = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  SUITE: 'Suite',
} as const

export const BOOKING_STATUS = {
  CONFIRMED: 'Confirmed',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },
  ROOMS: {
    LIST: '/api/rooms',
    GET: (id: string) => `/api/rooms/${id}`,
  },
  BOOKINGS: {
    LIST: '/api/bookings',
    CREATE: '/api/bookings',
  },
  AI: {
    PRICE_SUGGESTION: '/api/ai/price-suggestion',
    CHAT: '/api/ai/chat',
  },
} as const
