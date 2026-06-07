import api from '@/shared/api/base.api';
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

    const response = await api.post('/auth/login', data);
    return LoginResponseSchema.parse(response.data);
  },

  logout: async (): Promise<void> => {
    if (env.useAuthMock) {
      await mockLogout();
      return;
    }

    await api.post('/auth/logout');
  },
};
