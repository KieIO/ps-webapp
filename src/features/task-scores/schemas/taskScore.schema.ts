import { z } from 'zod';

export const TaskScoreDepartmentSchema = z.string().min(1).nullable();

export const TaskScoreSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  taskType: z.string().min(1),
  score: z.number().nonnegative(),
  group: z.string().min(1),
  department: TaskScoreDepartmentSchema.optional().default(null),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const TaskScoreListFiltersSchema = z.object({
  search: z.string().optional(),
  group: z.string().optional(),
});

export const TaskScoreListResponseSchema = z.object({
  items: z.array(TaskScoreSchema),
  total: z.number(),
});

export const CreateTaskScoreRequestSchema = z.object({
  name: z.string().trim().min(1, 'Task name is required'),
  taskType: z.string().trim().min(1, 'Task type is required'),
  score: z.number().nonnegative('Score must be 0 or greater'),
  group: z.string().min(1, 'Group is required'),
  department: TaskScoreDepartmentSchema.optional().default(null),
});

export const UpdateTaskScoreRequestSchema = CreateTaskScoreRequestSchema;

export type TaskScore = z.infer<typeof TaskScoreSchema>;
export type TaskScoreListFilters = z.infer<typeof TaskScoreListFiltersSchema>;
export type TaskScoreListResponse = z.infer<typeof TaskScoreListResponseSchema>;
export type CreateTaskScoreRequest = z.infer<typeof CreateTaskScoreRequestSchema>;
export type UpdateTaskScoreRequest = z.infer<typeof UpdateTaskScoreRequestSchema>;
