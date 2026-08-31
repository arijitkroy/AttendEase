import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('attend_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('attend_token');
      localStorage.removeItem('attend_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
