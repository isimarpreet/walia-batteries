import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL|| 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  
  getCurrentUser: () => 
    apiClient.get('/auth/me'),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};

// Customer APIs
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

// Battery APIs
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

export default apiClient;
