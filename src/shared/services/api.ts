const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include', // This sends cookies automatically
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (name: string, email: string, password: string) =>
    request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    }),

  getMe: () => request<any>('/auth/me'),

  getWardens: () => request<any[]>('/auth/wardens'),

  logout: () =>
    request<any>('/auth/logout', {
      method: 'POST',
    }),

  // Rooms
  getRooms: (params?: { type?: string; minPrice?: number; maxPrice?: number; available?: boolean; search?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/rooms' + query);
  },

  getRoom: (id: string) => request<any>(`/rooms/${id}`),

  createRoom: (data: any) =>
    request<any>('/rooms', {
      method: 'POST',
      body: data,
    }),

  updateRoom: (id: string, data: any) =>
    request<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deleteRoom: (id: string) =>
    request<void>(`/rooms/${id}`, {
      method: 'DELETE',
    }),

  getPendingRooms: () => request<any[]>('/rooms/pending'),

  approveRoom: (id: string) =>
    request<any>(`/rooms/${id}/approve`, {
      method: 'PATCH',
    }),

  rejectRoom: (id: string) =>
    request<any>(`/rooms/${id}/reject`, {
      method: 'PATCH',
    }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),

  markNotificationAsRead: (id: string) =>
    request<any>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  deleteNotification: (id: string) =>
    request<any>(`/notifications/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  getBookings: (params?: { paymentStatus?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/bookings' + query);
  },

  getBooking: (id: string) => request<any>(`/bookings/${id}`),

  createBooking: (roomId: string, checkInDate: string, checkOutDate: string) =>
    request<any>('/bookings', {
      method: 'POST',
      body: { roomId, checkInDate, checkOutDate },
    }),

  updateBookingStatus: (id: string, status: string) =>
    request<any>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status },
    }),

  // Booking Requests
  createBookingRequest: (data: { roomId: string; checkInDate: string; checkOutDate: string; message: string }) =>
    request<any>('/booking-requests', {
      method: 'POST',
      body: data,
    }),

  getAllBookingRequests: (params?: { status?: string }) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any[]>('/booking-requests' + query);
  },

  getUserBookingRequests: () => request<any[]>('/booking-requests/my-requests'),

  approveBookingRequest: (id: string) =>
    request<any>(`/booking-requests/${id}/approve`, {
      method: 'POST'
    }),

  rejectBookingRequest: (id: string) =>
    request<any>(`/booking-requests/${id}/reject`, {
      method: 'POST'
    }),

  // Analytics
  getAnalytics: () => request<any>('/analytics'),

  // Payment & Check-in
  processPayment: (id: string, paymentMethod: string) =>
    request<any>(`/bookings/${id}/payment`, {
      method: 'POST',
      body: { paymentMethod }
    }),

  checkIn: (id: string) =>
    request<any>(`/bookings/${id}/checkin`, {
      method: 'POST'
    }),

  checkOut: (id: string) =>
    request<any>(`/bookings/${id}/checkout`, {
      method: 'POST'
    }),
};
