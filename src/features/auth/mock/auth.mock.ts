import { mockDelay } from '@/shared/mock/mockDelay';
import type { LoginRequest, LoginResponse } from '../schemas/auth.schema';
import { DEV_MOCK_USERS } from './devUsers';

export { DEV_MOCK_USERS } from './devUsers';

const findDevUser = (email: string) =>
  DEV_MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const mockLogin = async (payload: LoginRequest): Promise<LoginResponse> => {
  await mockDelay();

  const user = findDevUser(payload.email);

  if (!user) {
    throw new Error(
      `Unknown dev account. Use one of: ${DEV_MOCK_USERS.map((entry) => entry.email).join(', ')}`,
    );
  }

  return {
    token: `dev-mock-${user.role}-${Date.now()}`,
    user: {
      id: `dev-${user.role}`,
      name: user.name,
      role: user.role,
    },
  };
};

export const mockLogout = async (): Promise<void> => {
  await mockDelay();
};
