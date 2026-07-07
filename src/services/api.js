import axios from 'axios';

// Base API Instance - normalize `VITE_API_URL` and avoid duplicate `/api`
const _base = import.meta.env.VITE_API_URL ;
const normalized = _base.replace(/\/+$/, '');
const baseURL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      // We can dispatch a logout action here if we inject the store
      console.error('Unauthorized access - potentially invalid token');
    }
    return Promise.reject(error);
  }
);

export default api;
