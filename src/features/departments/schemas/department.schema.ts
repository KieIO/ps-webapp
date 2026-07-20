import { z } from 'zod';

export const DepartmentSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const DepartmentListResponseSchema = z.object({
  items: z.array(DepartmentSchema),
  total: z.number(),
});

export const CreateDepartmentRequestSchema = z.object({
  /** Optional — backend generates from name when omitted. */
  code: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
});

export const UpdateDepartmentRequestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
});

export type Department = z.infer<typeof DepartmentSchema>;
export type DepartmentListResponse = z.infer<typeof DepartmentListResponseSchema>;
export type CreateDepartmentRequest = z.infer<typeof CreateDepartmentRequestSchema>;
export type UpdateDepartmentRequest = z.infer<typeof UpdateDepartmentRequestSchema>;
