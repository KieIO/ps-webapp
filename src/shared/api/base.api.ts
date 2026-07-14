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

      // Route-level access is enforced by ProtectedRoute. Do not redirect on API 403 —
      // secondary calls (e.g. optional option endpoints) must not bounce the whole page.
      if (status === 401 && !isLoginRequest) {
        store.dispatch(logout());
        queryClient.clear();
        window.location.replace(ROUTES.LOGIN);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
