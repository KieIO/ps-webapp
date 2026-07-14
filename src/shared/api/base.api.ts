import axios from 'axios';
import { ROUTES } from '@/config/constants';
import { env } from '@/config/env';
import { queryClient } from '@/shared/api/queryClient';
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
  (response) => {
    const body = response.data;
    if (
      body &&
      typeof body === 'object' &&
      'data' in body &&
      !Array.isArray(body) &&
      body.data !== undefined
    ) {
      response.data = body.data;
    }
    return response;
  },
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const requestUrl = error.config?.url ?? '';
      const isLoginRequest = requestUrl.includes('/auth/login');

      if (status === 401 && !isLoginRequest) {
        store.dispatch(logout());
        queryClient.clear();
        window.location.replace(ROUTES.LOGIN);
      } else if (status === 403 && !isLoginRequest) {
        window.location.replace(ROUTES.FORBIDDEN);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
