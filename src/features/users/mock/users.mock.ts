import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListFilters,
  UserListResponse,
} from '../schemas/user.schema';
import { mockDelay } from '@/shared/mock/mockDelay';
import { getMockUsersStore, setMockUsersStore } from './users.data';

const filterUsers = (users: User[], filters: UserListFilters): User[] => {
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
  const items = filterUsers(getMockUsersStore(), filters);
  return { items, total: items.length };
};

export const mockGetUserById = async (id: string): Promise<User> => {
  await mockDelay();
  const user = getMockUsersStore().find((entry) => entry.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
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

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    status: 'invited',
    department: payload.department,
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setMockUsersStore([newUser, ...users]);
  return newUser;
};

export const mockUpdateUser = async (id: string, payload: UpdateUserRequest): Promise<User> => {
  await mockDelay();

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

  const updated: User = {
    ...users[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  const next = [...users];
  next[index] = updated;
  setMockUsersStore(next);
  return updated;
};
