import { z } from 'zod';
import { ROLES } from '@/config/permissions';
import { USER_DEPARTMENTS } from '../constants';

export const USER_STATUSES = ['active', 'on_leave', 'inactive', 'invited'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum([
    ROLES.EMPLOYEE,
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]),
  status: z.enum(USER_STATUSES),
  department: z.enum(USER_DEPARTMENTS),
  /** FK to `JobTitle.id` — assigned by admin; null until set. */
  jobTitleId: z.string().nullable(),
  jobTitleCode: z.string().optional(),
  jobTitleName: z.string().optional(),
  jobLevelCode: z.string().optional(),
  jobLevelLabel: z.string().optional(),
  positionCode: z.string().optional(),
  joinedAt: z.string(),
  updatedAt: z.string().optional(),
});

export const UserListFiltersSchema = z.object({
  search: z.string().optional(),
  role: z
    .enum([
      ROLES.EMPLOYEE,
      ROLES.PM,
      ROLES.CREATIVE_MANAGER,
      ROLES.CREATIVE_HEAD,
      ROLES.HEAD,
      ROLES.ADMIN,
    ])
    .optional(),
  status: z.enum(USER_STATUSES).optional(),
  department: z.enum(USER_DEPARTMENTS).optional(),
});

export const UserListResponseSchema = z.object({
  items: z.array(UserSchema),
  total: z.number(),
});

export const CreateUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum([
    ROLES.EMPLOYEE,
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]),
  department: z.enum(USER_DEPARTMENTS),
  /** Optional — server uses default when omitted or blank. */
  password: z.string().trim().min(5, 'Password must be at least 5 characters').optional(),
});

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum([
    ROLES.EMPLOYEE,
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]),
  status: z.enum(USER_STATUSES),
  department: z.enum(USER_DEPARTMENTS),
  jobTitleId: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;
export type UserListFilters = z.infer<typeof UserListFiltersSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
