import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// JWT token storage
let jwtToken: string | null = localStorage.getItem('jwtToken');

// Axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  },
});

// Interceptor to update token on each request
api.interceptors.request.use((config) => {
  if (jwtToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${jwtToken}`;
  }
  return config;
});

// Token setter utility
export const setJwtToken = (token: string) => {
  jwtToken = token;
  localStorage.setItem('jwtToken', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Auth API
export const login = async (credentials: { username: string; password: string }) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

// Generic POST
export const postData = async (endpoint: string, data: any) => {
  const response = await api.post(`/api/${endpoint}`, data);
  return response.data;
};

// Generic PUT
export const updateData = async (endpoint: string, id: string | number, data: any) => {
  const response = await api.put(`/api/${endpoint}/${id}`, data);
  return response.data;
};

// Generic DELETE
export const deleteData = async (endpoint: string, id: string | number) => {
  const response = await api.delete(`/api/${endpoint}/${id}`);
  return response.data;
};

// Fetch APIs
export const fetchEmployees = async () => {
  try {
    const response = await api.get('/api/employees');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

export const fetchVendors = async () => {
  try {
    const response = await api.get('/api/vendors');
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

export const fetchApprovers = async () => {
  try {
    const response = await api.get('/api/approvers');
    return response.data;
  } catch (error) {
    console.error('Error fetching approvers:', error);
    return [];
  }
};

export const fetchLocations = async () => {
  try {
    const response = await api.get('/api/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const fetchBillingCycleRules = async () => {
  try {
    const response = await api.get('/api/billing-cycle-rules');
    return response.data;
  } catch (error) {
    console.error('Error fetching billing cycle rules:', error);
    return [];
  }
};
