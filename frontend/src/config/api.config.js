// Centralized API configuration
// Change this URL when deploying to production
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  AUTH_PROTECTED: '/auth/protected',

  // Customers
  CUSTOMER_CREATE: '/customers/create',
  CUSTOMER_SEARCH: '/customers/search',
  CUSTOMER_ALL: '/customers/all',
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,

  // Batteries
  BATTERY_CREATE: '/batteries/create',
  BATTERY_BY_CUSTOMER: (customerId) => `/batteries/customer/${customerId}`,
  BATTERY_ALL: '/batteries/all',
  BATTERY_BY_ID: (id) => `/batteries/${id}`,

  // Brands
  BRAND_CREATE: '/brands/create',
  BRAND_ALL: '/brands/all',
  BRAND_BY_ID: (id) => `/brands/${id}`,

  // Models
  MODEL_CREATE: '/models/create',
  MODEL_ALL: '/models/all',
  MODEL_BY_ID: (id) => `/models/${id}`,
};
