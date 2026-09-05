import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://plan-pessoal-93978f82c0a7.herokuapp.com/',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Se for uma requisição de login falha, deixa a tela de login lidar
      if (!error.config.url?.includes('/login')) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
