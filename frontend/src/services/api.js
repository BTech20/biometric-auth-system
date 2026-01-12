import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  healthCheck: () => api.get('/health'),
  register: (userData) => api.post('/register', userData),
  loginWithPassword: (credentials) => api.post('/login', credentials),
  loginWithBiometrics: (biometricData) => api.post('/login', biometricData),
  verifyBiometrics: (biometricData, customThreshold = null) => {
    const data = customThreshold !== null 
      ? { ...biometricData, threshold: customThreshold }
      : biometricData;
    return api.post('/verify', data);
  },
  getProfile: () => api.get('/user/profile'),
  getStats: () => api.get('/stats'),
};

export default api;