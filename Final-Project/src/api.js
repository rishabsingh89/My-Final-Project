import axios from 'axios';

const isProd = import.meta.env.PROD;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:5000/api'),
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor to handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if unauthorized
      localStorage.removeItem('token');
      // window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
