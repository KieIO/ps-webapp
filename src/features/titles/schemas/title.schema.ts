import { z } from 'zod';

export const JobLevelSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const JobGroupSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const JobTitleSchema = z.object({
  id: z.string(),
  code: z.string().min(1),
  name: z.string().min(1),
  jobLevelId: z.string(),
  jobGroupId: z.string(),
  sortOrder: z.number().int().nonnegative(),
  dailyCapacityPoints: z.number().nonnegative(),
  taskConversionRatio: z.number().min(0).max(100),
  specialistTaskPoints: z.number().nonnegative(),
  createdAt: z.string(),
});

export const JobTitleListItemSchema = JobTitleSchema.extend({
  jobLevelCode: z.string(),
  jobLevelLabel: z.string(),
  jobGroupCode: z.string(),
  jobGroupLabel: z.string(),
});

export const JobTitleListFiltersSchema = z.object({
  search: z.string().optional(),
  jobLevelId: z.string().optional(),
  jobGroupId: z.string().optional(),
});

export const JobLevelListResponseSchema = z.object({
  items: z.array(JobLevelSchema),
  total: z.number(),
});

export const JobGroupListResponseSchema = z.object({
  items: z.array(JobGroupSchema),
  total: z.number(),
});

export const JobTitleListResponseSchema = z.object({
  items: z.array(JobTitleListItemSchema),
  total: z.number(),
});

export const CreateJobLevelRequestSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  label: z.string().trim().min(1, 'Label is required'),
});

export const CreateJobGroupRequestSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  label: z.string().trim().min(1, 'Label is required'),
});

export const CreateJobTitleRequestSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  name: z.string().trim().min(1, 'Title is required'),
  jobLevelId: z.string().min(1, 'Job level is required'),
  jobGroupId: z.string().min(1, 'Job group is required'),
});

export const UpdateJobTitleCapacityRequestSchema = z.object({
  dailyCapacityPoints: z.number().nonnegative('Capacity must be 0 or greater'),
  taskConversionRatio: z
    .number()
    .min(0, 'Ratio must be at least 0')
    .max(100, 'Ratio must be at most 100'),
});

export type JobLevel = z.infer<typeof JobLevelSchema>;
export type JobGroup = z.infer<typeof JobGroupSchema>;
export type JobTitle = z.infer<typeof JobTitleSchema>;
export type JobTitleListItem = z.infer<typeof JobTitleListItemSchema>;
export type JobTitleListFilters = z.infer<typeof JobTitleListFiltersSchema>;
export type JobLevelListResponse = z.infer<typeof JobLevelListResponseSchema>;
export type JobGroupListResponse = z.infer<typeof JobGroupListResponseSchema>;
export type JobTitleListResponse = z.infer<typeof JobTitleListResponseSchema>;
export type CreateJobLevelRequest = z.infer<typeof CreateJobLevelRequestSchema>;
export type CreateJobGroupRequest = z.infer<typeof CreateJobGroupRequestSchema>;
export type CreateJobTitleRequest = z.infer<typeof CreateJobTitleRequestSchema>;
export type UpdateJobTitleCapacityRequest = z.infer<typeof UpdateJobTitleCapacityRequestSchema>;
