import { ROLES } from '@/config/permissions';

/** Persisted user fields only (labels enriched on read in mock/API). */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  status: 'active' | 'inactive' | 'invited';
  department: 'project' | 'creative' | 'admin';
  jobTitleId: string | null;
  joinedAt: string;
  updatedAt?: string;
}

const now = new Date().toISOString();

export const INITIAL_MOCK_USERS: UserRecord[] = [
  {
    id: 'usr-001',
    name: 'Nguyen Van An',
    email: 'an.nguyen@pokeslide.com',
    role: ROLES.ADMIN,
    status: 'active',
    department: 'admin',
    jobTitleId: 'title-pm-2',
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
    jobTitleId: 'title-pm-2',
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
    jobTitleId: 'title-pm-2',
    joinedAt: '2023-05-22T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-004',
    name: 'Pham Thu Dung',
    email: 'dung.pham@pokeslide.com',
    role: ROLES.PM,
    status: 'active',
    department: 'project',
    jobTitleId: 'title-pm-1',
    joinedAt: '2024-01-08T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-005',
    name: 'Hoang Van Em',
    email: 'em.hoang@pokeslide.com',
    role: ROLES.CREATIVE_HEAD,
    status: 'active',
    department: 'creative',
    jobTitleId: 'title-sgd-2',
    joinedAt: '2023-06-01T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-006',
    name: 'Vo Thi Phuong',
    email: 'phuong.vo@pokeslide.com',
    role: ROLES.CREATIVE_MANAGER,
    status: 'active',
    department: 'creative',
    jobTitleId: 'title-gd-2',
    joinedAt: '2023-08-14T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-007',
    name: 'Dang Quoc Giang',
    email: 'giang.dang@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'active',
    department: 'project',
    jobTitleId: 'title-jpe-1',
    joinedAt: '2024-02-20T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-008',
    name: 'Bui Thi Hoa',
    email: 'hoa.bui@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'active',
    department: 'creative',
    jobTitleId: 'title-jgd-2',
    joinedAt: '2024-03-05T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-009',
    name: 'Ngo Van Khoa',
    email: 'khoa.ngo@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'inactive',
    department: 'project',
    jobTitleId: 'title-pe-1',
    joinedAt: '2022-11-30T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-010',
    name: 'Ly Thi Lan',
    email: 'lan.ly@pokeslide.com',
    role: ROLES.EMPLOYEE,
    status: 'invited',
    department: 'creative',
    jobTitleId: null,
    joinedAt: '2025-05-01T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-011',
    name: 'Mai Van Long',
    email: 'long.mai@pokeslide.com',
    role: ROLES.CREATIVE_MANAGER,
    status: 'invited',
    department: 'creative',
    jobTitleId: null,
    joinedAt: '2025-05-15T00:00:00.000Z',
    updatedAt: now,
  },
  {
    id: 'usr-012',
    name: 'Truong Thi My',
    email: 'my.truong@pokeslide.com',
    role: ROLES.PM,
    status: 'inactive',
    department: 'project',
    jobTitleId: 'title-spe-2',
    joinedAt: '2022-07-18T00:00:00.000Z',
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
