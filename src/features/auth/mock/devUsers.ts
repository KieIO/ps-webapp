import { ROLES, type Role } from '@/config/permissions';
import { mockDelay } from '@/shared/mock/mockDelay';
import type { LoginRequest, LoginResponse } from '../schemas/auth.schema';

export interface DevMockUser {
  email: string;
  name: string;
  role: Role;
  department?: string;
}

export const DEV_MOCK_USERS: DevMockUser[] = [
  {
    email: 'employee@pokeslide.dev',
    name: 'Dev Employee',
    role: ROLES.EMPLOYEE,
    department: 'project',
  },
  { email: 'pm@pokeslide.dev', name: 'Dev PM', role: ROLES.PM, department: 'project' },
  {
    email: 'creative-manager@pokeslide.dev',
    name: 'Dev Creative Manager',
    role: ROLES.CREATIVE_MANAGER,
    department: 'creative_hcm',
  },
  {
    email: 'creative-head@pokeslide.dev',
    name: 'Dev Creative Head',
    role: ROLES.CREATIVE_HEAD,
    department: 'creative_hcm',
  },
  {
    email: 'head@pokeslide.dev',
    name: 'Dev Department Head',
    role: ROLES.HEAD,
    department: 'project',
  },
  { email: 'admin@pokeslide.dev', name: 'Dev Admin', role: ROLES.ADMIN, department: 'project' },
];

const findDevUser = (email: string): DevMockUser | undefined =>
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
      department: user.department,
    },
  };
};

export const mockLogout = async (): Promise<void> => {
  await mockDelay();
};
