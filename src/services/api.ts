import axios from 'axios';

// Em desenvolvimento (localhost), usa o proxy /api/ do Vite para contornar o bloqueio de CORS do backend Heroku.
// Em produção (Vercel), usa a URL direta configurada no .env ou padrão Heroku.
const baseURL = import.meta.env.DEV
  ? '/api/'
  : (import.meta.env.VITE_API_URL || 'https://plan-pessoal-93978f82c0a7.herokuapp.com/');

const api = axios.create({
  baseURL,
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
      const requestUrl = error.config?.url || '';
      // Se for uma requisição de login falha, NÃO redireciona para que a tela possa exibir o toast de credenciais inválidas
      if (!requestUrl.includes('login')) {
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
