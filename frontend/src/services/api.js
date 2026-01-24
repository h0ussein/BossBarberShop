// Use environment variable for API URL, fallback to relative path in production
import dotenv from 'dotenv'
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api";

// Helper function for API calls with specific token type
const apiCallWithToken = async (endpoint, options = {}, tokenKey = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Get the appropriate token
  let token = null;
  if (tokenKey) {
    token = localStorage.getItem(tokenKey);
  } else {
    // Default: try all tokens (for public/general endpoints)
    token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('barberToken');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// General API call (for public endpoints or when token type doesn't matter)
const apiCall = (endpoint, options = {}) => apiCallWithToken(endpoint, options, null);

// User-specific API call
const userApiCall = (endpoint, options = {}) => apiCallWithToken(endpoint, options, 'token');

// Admin-specific API call  
const adminApiCall = (endpoint, options = {}) => apiCallWithToken(endpoint, options, 'adminToken');

// Barber-specific API call
const barberApiCall = (endpoint, options = {}) => apiCallWithToken(endpoint, options, 'barberToken');

// User Auth API
export const authAPI = {
  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  verifyEmail: (token) =>
    apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email) =>
    apiCall('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  getProfile: () => userApiCall('/auth/profile'),

  updateProfile: (data) =>
    userApiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Admin Auth API
export const adminAPI = {
  login: (credentials) =>
    apiCall('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => adminApiCall('/admin/profile'),

  createAdmin: (adminData) =>
    adminApiCall('/admin/create', {
      method: 'POST',
      body: JSON.stringify(adminData),
    }),

  getAllAdmins: () => adminApiCall('/admin/all'),

  updateAdmin: (id, data) =>
    adminApiCall(`/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAdmin: (id) =>
    adminApiCall(`/admin/${id}`, {
      method: 'DELETE',
    }),
};

// Barbers API (public endpoints + admin-protected for mutations)
export const barbersAPI = {
  // Public endpoints
  getAll: (activeOnly = false) => 
    apiCall(`/barbers${activeOnly ? '?active=true' : ''}`),
  
  getById: (id) => apiCall(`/barbers/${id}`),
  
  getSchedule: (id) => apiCall(`/barbers/${id}/schedule`),
  
  // Admin-protected endpoints
  create: (data) =>
    adminApiCall('/barbers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) =>
    adminApiCall(`/barbers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) =>
    adminApiCall(`/barbers/${id}`, {
      method: 'DELETE',
    }),
  
  updateSchedule: (id, data) =>
    adminApiCall(`/barbers/${id}/schedule`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  addDayOff: (id, data) =>
    adminApiCall(`/barbers/${id}/dayoff`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  removeDayOff: (id, date) =>
    adminApiCall(`/barbers/${id}/dayoff/${date}`, {
      method: 'DELETE',
    }),
  
  updateAvatar: (id, data) =>
    adminApiCall(`/barbers/${id}/avatar`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Services API (public endpoints + admin-protected for mutations)
export const servicesAPI = {
  // Public endpoints
  getAll: (activeOnly = false) => 
    apiCall(`/services${activeOnly ? '?active=true' : ''}`),
  
  getById: (id) => apiCall(`/services/${id}`),
  
  // Admin-protected endpoints
  create: (data) =>
    adminApiCall('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id, data) =>
    adminApiCall(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) =>
    adminApiCall(`/services/${id}`, {
      method: 'DELETE',
    }),
};

// Bookings API (public create + admin-protected for management)
export const bookingsAPI = {
  // Public endpoints
  create: (data) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getAvailableSlots: (date, barberId) =>
    apiCall(`/bookings/slots?date=${date}&barber=${barberId}`),
  
  // Admin-protected endpoints
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return adminApiCall(`/bookings${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => adminApiCall(`/bookings/${id}`),
  
  update: (id, data) =>
    adminApiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id) =>
    adminApiCall(`/bookings/${id}`, {
      method: 'DELETE',
    }),
  
  getStats: () => adminApiCall('/bookings/stats'),
};

// Settings API (public get + admin-protected for mutations)
export const settingsAPI = {
  // Public endpoint
  get: () => apiCall('/settings'),
  
  // Admin-protected endpoints
  update: (data) =>
    adminApiCall('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateHours: (data) =>
    adminApiCall('/settings/hours', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Barber Auth API (for barber's own portal)
export const barberAuthAPI = {
  login: (credentials) =>
    apiCall('/barber-auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getProfile: () => barberApiCall('/barber-auth/profile'),

  updateSchedule: (data) =>
    barberApiCall('/barber-auth/schedule', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addDayOff: (data) =>
    barberApiCall('/barber-auth/dayoff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeDayOff: (date) =>
    barberApiCall(`/barber-auth/dayoff/${date}`, {
      method: 'DELETE',
    }),

  getBookings: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return barberApiCall(`/barber-auth/bookings${params ? `?${params}` : ''}`);
  },

  updateBooking: (id, data) =>
    barberApiCall(`/barber-auth/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data) =>
    barberApiCall('/barber-auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateAvatar: (data) =>
    barberApiCall('/barber-auth/avatar', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Upload API (for ImageKit authentication)
export const uploadAPI = {
  // Get auth params for admin uploads
  getAuthParamsAdmin: () => adminApiCall('/upload/auth'),
  
  // Get auth params for barber uploads
  getAuthParamsBarber: () => barberApiCall('/upload/auth'),
};

export default apiCall;
