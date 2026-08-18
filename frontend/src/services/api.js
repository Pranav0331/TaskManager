import axios from 'axios';

const PROD_API_URL = 'https://taskflow-backend-ezd1.onrender.com/api';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;

  // Fallback to production backend URL if unset, relative, or mistakenly set to frontend domain in production
  if (!url || url === '/api' || url.includes('vercel.app')) {
    url = import.meta.env.PROD ? PROD_API_URL : (url || '/api');
  }

  // Strip trailing slashes and any mistakenly appended route suffixes
  url = url.replace(/\/+$/, '').replace(/\/auth\/login$/, '').replace(/\/login$/, '');

  // Ensure /api suffix exists on backend origin if missing
  if (url.startsWith('http') && !url.endsWith('/api') && !url.includes('/api/')) {
    url = `${url}/api`;
  }

  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
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

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicPaths = ['/login', '/register', '/verify-otp'];
      const isPublicPath = publicPaths.some((path) => window.location.pathname.startsWith(path));
      if (!isPublicPath && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
