import { z } from 'zod';
import { ROLES } from '@/config/permissions';

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum([
    ROLES.EMPLOYEE,
    ROLES.PM,
    ROLES.CREATIVE_MANAGER,
    ROLES.CREATIVE_HEAD,
    ROLES.HEAD,
    ROLES.ADMIN,
  ]),
  department: z.string().optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: AuthUserSchema,
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
