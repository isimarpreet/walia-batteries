import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

export const customerAPI = {
  create: (data) =>
    apiClient.post('/customers/create', data),
  searchByPhone: (phone) =>
    apiClient.get('/customers/search', { params: { phone } }),
  getAll: (page, pageSize) =>
    apiClient.get('/customers/all', { params: { page, page_size: pageSize } }),
  getById: (id) =>
    apiClient.get(`/customers/${id}`),
};

export const batteryAPI = {
  create: (data) =>
    apiClient.post('/batteries/create', data),
  getByCustomer: (customerId) =>
    apiClient.get(`/batteries/customer/${customerId}`),
  getAll: (page, pageSize) =>
    apiClient.get('/batteries/all', { params: { page, page_size: pageSize } }),
  getById: (id) =>
    apiClient.get(`/batteries/${id}`),
};

export const brandAPI = {
  create: (data) =>
    apiClient.post('/brands/create', data),
  getAll: (isActive) =>
    apiClient.get('/brands/all', {
      params: isActive !== undefined ? { is_active: isActive } : {},
    }),
  getById: (id) =>
    apiClient.get(`/brands/${id}`),
};

export const modelAPI = {
  create: (data) =>
    apiClient.post('/models/create', data),
  getAll: (brandId, isActive) =>
    apiClient.get('/models/all', {
      params: {
        ...(brandId != null ? { brand_id: brandId } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
      },
    }),
  getById: (id) =>
    apiClient.get(`/models/${id}`),
};

export const claimAPI = {
  create: (data) =>
    apiClient.post('/claims/create', data),
  getAll: (page, pageSize, status) =>
    apiClient.get('/claims/all', {
      params: {
        ...(page ? { page } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
        ...(status ? { status } : {}),
      },
    }),
  getByCustomer: (customerId) =>
    apiClient.get(`/claims/customer/${customerId}`),
  getById: (id) =>
    apiClient.get(`/claims/${id}`),
};

export default apiClient;
