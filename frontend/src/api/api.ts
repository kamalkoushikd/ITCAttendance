import axios from 'axios';

const BASE_URL = 'https://backend.attendance.kamalkoushikd.cfd'; // Update with your backend URL

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
  // Always get the latest token from localStorage
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Remove Authorization header if no token
    if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
    }
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

// Fetch designations for a vendor (with token automatically handled by axios instance)
export const fetchDesignations = async (vendor_name?: string) => {
  let url = '/api/designations';
  if (vendor_name) url += `?vendor_name=${encodeURIComponent(vendor_name)}`;
  const response = await api.get(url);
  return response.data;
};

// Fetch employees under the logged-in approver
export const fetchApproverEmployees = async () => {
  // Use the api instance, which already attaches the Authorization header via interceptor
  console.log(localStorage.getItem('jwtToken')); // Debugging line to check token
  const response = await api.get('/api/employees');
  if (Array.isArray(response.data)) {
    console.log('Fetched employees:', response.data); // Debugging line
    return response.data;
  }
  return [];
};
