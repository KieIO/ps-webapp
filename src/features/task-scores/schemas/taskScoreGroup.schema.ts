import { z } from 'zod';

export const TaskScoreGroupDepartmentSchema = z.string().min(1).nullable();

export const TaskScoreGroupRecordSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  label: z.string().min(1),
  colorKey: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  department: TaskScoreGroupDepartmentSchema.optional().default(null),
  createdAt: z.string(),
});

export const TaskScoreGroupListResponseSchema = z.object({
  items: z.array(TaskScoreGroupRecordSchema),
  total: z.number(),
});

export const CreateTaskScoreGroupRequestSchema = z.object({
  label: z.string().trim().min(1, 'Group name is required'),
  department: TaskScoreGroupDepartmentSchema.optional(),
});

export const UpdateTaskScoreGroupRequestSchema = z.object({
  department: TaskScoreGroupDepartmentSchema,
});

export type TaskScoreGroupRecord = z.infer<typeof TaskScoreGroupRecordSchema>;
export type TaskScoreGroupListResponse = z.infer<typeof TaskScoreGroupListResponseSchema>;
export type CreateTaskScoreGroupRequest = z.infer<typeof CreateTaskScoreGroupRequestSchema>;
export type UpdateTaskScoreGroupRequest = z.infer<typeof UpdateTaskScoreGroupRequestSchema>;
