import { ROLES } from '@/config/permissions';
import type { User } from '../schemas/user.schema';

const now = new Date().toISOString();

export const INITIAL_MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Nguyen Van An',
    email: 'an.nguyen@pokeslide.com',
    role: ROLES.ADMIN,
    status: 'active',
    department: 'admin',
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
    joinedAt: '2022-07-18T00:00:00.000Z',
    updatedAt: now,
  },
];

let mockUsersStore: User[] = [...INITIAL_MOCK_USERS];

export const getMockUsersStore = (): User[] => mockUsersStore;

export const resetMockUsersStore = (): void => {
  mockUsersStore = [...INITIAL_MOCK_USERS];
};

export const setMockUsersStore = (users: User[]): void => {
  mockUsersStore = users;
};
