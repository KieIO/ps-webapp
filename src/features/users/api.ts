/**
 * Backend contract: docs/USERS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import api from '@/shared/api/base.api';
import { env } from '@/config/env';
import {
  mockCreateUser,
  mockGetUserById,
  mockGetUserList,
  mockUpdateUser,
} from './mock/users.mock';
import {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UserListFiltersSchema,
  UserListResponseSchema,
  UserSchema,
  type CreateUserRequest,
  type UpdateUserRequest,
  type User,
  type UserListFilters,
  type UserListResponse,
} from './schemas/user.schema';

export const userApi = {
  getList: async (filters: UserListFilters): Promise<UserListResponse> => {
    const params = UserListFiltersSchema.parse(filters);

    if (env.useUsersMock) {
      return UserListResponseSchema.parse(await mockGetUserList(params));
    }

    const response = await api.get('/users', { params });
    return UserListResponseSchema.parse(response.data);
  },

  getById: async (id: string): Promise<User> => {
    if (env.useUsersMock) {
      return UserSchema.parse(await mockGetUserById(id));
    }

    const response = await api.get(`/users/${id}`);
    return UserSchema.parse(response.data);
  },

  create: async (payload: CreateUserRequest): Promise<User> => {
    const data = CreateUserRequestSchema.parse(payload);

    if (env.useUsersMock) {
      return UserSchema.parse(await mockCreateUser(data));
    }

    const response = await api.post('/users', data);
    return UserSchema.parse(response.data);
  },

  update: async (id: string, payload: UpdateUserRequest): Promise<User> => {
    const data = UpdateUserRequestSchema.parse(payload);

    if (env.useUsersMock) {
      return UserSchema.parse(await mockUpdateUser(id, data));
    }

    const response = await api.patch(`/users/${id}`, data);
    return UserSchema.parse(response.data);
  },
};
