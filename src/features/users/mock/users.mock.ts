import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListFilters,
  UserListResponse,
} from '../schemas/user.schema';
import { mockDelay } from '@/shared/mock/mockDelay';
import { getMockJobLevelsStore, getMockJobTitlesStore } from '@/features/titles/mock/titles.data';
import { getMockUsersStore, setMockUsersStore, type UserRecord } from './users.data';

const enrichUser = (user: UserRecord): User => {
  if (!user.jobTitleId) {
    return { ...user };
  }

  const title = getMockJobTitlesStore().find((entry) => entry.id === user.jobTitleId);
  const level = title
    ? getMockJobLevelsStore().find((entry) => entry.id === title.jobLevelId)
    : undefined;
  return {
    ...user,
    jobTitleCode: title?.code,
    jobTitleName: title?.name,
    jobLevelCode: level?.code,
    jobLevelLabel: level?.label,
    positionCode: title?.code,
  };
};

const assertJobTitleExists = (jobTitleId: string | null) => {
  if (jobTitleId === null) return;

  const title = getMockJobTitlesStore().find((entry) => entry.id === jobTitleId);
  if (!title) {
    throw new Error('Selected job title does not exist');
  }
};

const filterUsers = (users: UserRecord[], filters: UserListFilters): UserRecord[] => {
  const search = filters.search?.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (search) {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

export const mockGetUserList = async (filters: UserListFilters): Promise<UserListResponse> => {
  await mockDelay();
  const items = filterUsers(getMockUsersStore(), filters).map(enrichUser);
  return { items, total: items.length };
};

export const mockGetUserById = async (id: string): Promise<User> => {
  await mockDelay();
  const user = getMockUsersStore().find((entry) => entry.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return enrichUser(user);
};

export const mockCreateUser = async (payload: CreateUserRequest): Promise<User> => {
  await mockDelay();

  const users = getMockUsersStore();
  const duplicate = users.find(
    (entry) => entry.email.toLowerCase() === payload.email.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('A user with this email already exists');
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    status: 'invited',
    department: payload.department,
    jobTitleId: null,
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setMockUsersStore([newUser, ...users]);
  return enrichUser(newUser);
};

export const mockUpdateUser = async (id: string, payload: UpdateUserRequest): Promise<User> => {
  await mockDelay();

  assertJobTitleExists(payload.jobTitleId);

  const users = getMockUsersStore();
  const index = users.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }

  const duplicate = users.find(
    (entry) => entry.id !== id && entry.email.toLowerCase() === payload.email.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('A user with this email already exists');
  }

  const updated: UserRecord = {
    ...users[index],
    name: payload.name,
    email: payload.email,
    role: payload.role,
    status: payload.status,
    department: payload.department,
    jobTitleId: payload.jobTitleId,
    updatedAt: new Date().toISOString(),
  };

  const next = [...users];
  next[index] = updated;
  setMockUsersStore(next);
  return enrichUser(updated);
};
