import axios from 'axios';
import { ROUTES } from '@/config/constants';
import { env } from '@/config/env';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        store.dispatch(logout());
        window.location.replace(ROUTES.LOGIN);
      } else if (status === 403) {
        window.location.replace(ROUTES.FORBIDDEN);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
