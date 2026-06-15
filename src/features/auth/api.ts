import api from '@/shared/api/base.api';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { env } from '@/config/env';
import { mockLogin, mockLogout } from './mock/auth.mock';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  type LoginRequest,
  type LoginResponse,
} from './schemas/auth.schema';

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const data = LoginRequestSchema.parse(payload);

    if (env.useAuthMock) {
      return LoginResponseSchema.parse(await mockLogin(data));
    }

    const response = await api.post('/auth/login', data).catch((error: unknown) => {
      throw new Error(getApiErrorMessage(error, 'Invalid email or password'));
    });
    return LoginResponseSchema.parse(response.data);
  },

  logout: async (): Promise<void> => {
    if (env.useAuthMock) {
      await mockLogout();
    }
  },
};
