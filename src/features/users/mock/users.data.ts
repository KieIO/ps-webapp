import { ROLES } from '@/config/permissions';

/** Persisted user fields only (labels enriched on read in mock/API). */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  status: 'active' | 'on_leave' | 'inactive' | 'invited';
  department: 'creative_hcm' | 'project' | 'creative_ag';
  jobTitleId: string | null;
  joinedAt: string;
  updatedAt?: string;
}

const now = new Date().toISOString();

/** Curated demo set — aligned with ps-be/internal/seed/seed_users.go (dev accounts + mock users). */
export const INITIAL_MOCK_USERS: UserRecord[] = [
  {
    id: 'usr-dev-employee',
    name: 'Dev Employee',
    email: 'employee@pokeslide.dev',
    role: ROLES.EMPLOYEE,
    status: 'active',
    department: 'project',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-dev-pm',
    name: 'Dev PM',
    email: 'pm@pokeslide.dev',
    role: ROLES.PM,
    status: 'active',
    department: 'project',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-dev-creative-manager',
    name: 'Dev Creative Manager',
    email: 'creative-manager@pokeslide.dev',
    role: ROLES.CREATIVE_MANAGER,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-dev-creative-head',
    name: 'Dev Creative Head',
    email: 'creative-head@pokeslide.dev',
    role: ROLES.CREATIVE_HEAD,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-dev-head',
    name: 'Dev Department Head',
    email: 'head@pokeslide.dev',
    role: ROLES.HEAD,
    status: 'active',
    department: 'project',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-dev-admin',
    name: 'Dev Admin',
    email: 'admin@pokeslide.dev',
    role: ROLES.ADMIN,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: now,
    updatedAt: now,
  },
  {
    id: 'usr-001',
    name: 'Nguyen Van An',
    email: 'an.nguyen@pokeslide.com',
    role: ROLES.ADMIN,
    status: 'active',
    department: 'creative_hcm',
    jobTitleId: 'title-pm-6',
    joinedAt: '2023-01-15T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-002',
    name: 'Tran Thi Binh',
    email: 'binh.tran@pokeslide.com',
    role: ROLES.HEAD,
    status: 'active',
    department: 'project',
    jobTitleId: 'title-pm-6',
    joinedAt: '2023-03-10T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-003',
    name: 'Le Minh Cuong',
    email: 'cuong.le@pokeslide.com',
    role: ROLES.PM,
    status: 'active',
    department: 'project',
    jobTitleId: 'title-pm-6',
    joinedAt: '2023-05-22T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-004',
    name: 'Dang Quoc Giang',
    email: 'giang.dang@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'active',
    department: 'project',
    jobTitleId: 'title-jpe-3',
    joinedAt: '2024-02-20T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-005',
    name: 'Ly Thi Lan',
    email: 'lan.ly@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'invited',
    department: 'creative_hcm',
    jobTitleId: null,
    joinedAt: '2025-05-01T00:00:00.000Z',
    updatedAt: now,
  },
];

let mockUsersStore: UserRecord[] = [...INITIAL_MOCK_USERS];

export const getMockUsersStore = (): UserRecord[] => mockUsersStore;

export const resetMockUsersStore = (): void => {
  mockUsersStore = [...INITIAL_MOCK_USERS];
};

export const setMockUsersStore = (users: UserRecord[]): void => {
  mockUsersStore = users;
};
