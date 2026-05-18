import axios from 'axios';
import { clearAuthStorage, isTokenExpired, notifySessionLogout } from './session';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Adjust according to your backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        clearAuthStorage();
        notifySessionLogout('expired');
        return Promise.reject(new Error('Session expired, please login again'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login')) {
      clearAuthStorage();
      notifySessionLogout('expired');
    }
    return Promise.reject(error);
  }
);

export default api;
