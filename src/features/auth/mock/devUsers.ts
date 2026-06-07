import { ROLES, type Role } from '@/config/permissions';
import type { LoginRequest, LoginResponse } from '../schemas/auth.schema';

export interface DevMockUser {
  email: string;
  name: string;
  role: Role;
}

export const DEV_MOCK_USERS: DevMockUser[] = [
  { email: 'employee@pokeslide.dev', name: 'Dev Employee', role: ROLES.EMPLOYEE },
  { email: 'pm@pokeslide.dev', name: 'Dev PM', role: ROLES.PM },
  {
    email: 'creative-manager@pokeslide.dev',
    name: 'Dev Creative Manager',
    role: ROLES.CREATIVE_MANAGER,
  },
  { email: 'creative-head@pokeslide.dev', name: 'Dev Creative Head', role: ROLES.CREATIVE_HEAD },
  { email: 'head@pokeslide.dev', name: 'Dev Department Head', role: ROLES.HEAD },
  { email: 'admin@pokeslide.dev', name: 'Dev Admin', role: ROLES.ADMIN },
];

const MOCK_DELAY_MS = 400;

const findDevUser = (email: string): DevMockUser | undefined =>
  DEV_MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const mockLogin = async (payload: LoginRequest): Promise<LoginResponse> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

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
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
};
