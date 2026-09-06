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
  const url = config.url || '';
  const isAuthEndpoint = url.includes('login') || (url.includes('users') && config.method?.toLowerCase() === 'post');

  // Não envia cabeçalho de autorização para rotas públicas (login e cadastro)
  if (isAuthEndpoint) {
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Authorization');
      } else {
        delete config.headers['Authorization'];
      }
    }
    delete api.defaults.headers.common['Authorization'];
    return config;
  }

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

      // Limpa dados de sessão residuais em caso de falha de autenticação
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('userId');
      delete api.defaults.headers.common['Authorization'];

      // Se não for rota de login, redireciona para tela de login
      if (!requestUrl.includes('login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
