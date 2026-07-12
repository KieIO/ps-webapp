/**
 * Zod schemas for Projects API responses.
 * Backend contract: docs/PROJECTS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import { z } from 'zod';

export const EVALUATION_LEVELS = [1, 2, 3, 4] as const;

export const PROJECT_STATUSES = ['not_updated', 'in_progress', 'finish', 'cancel'] as const;

export const PROJECT_DEPARTMENTS = ['project', 'creative', 'admin'] as const;

export const PROJECT_URGENCIES = ['red', 'orange', 'green', 'gray'] as const;

export type EvaluationLevel = (typeof EVALUATION_LEVELS)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectDepartment = (typeof PROJECT_DEPARTMENTS)[number];
export type ProjectUrgency = (typeof PROJECT_URGENCIES)[number];

export const PersonWithCodeSchema = z.object({
  code: z.string(),
  name: z.string(),
  userId: z.string().optional(),
});

export const ClientRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/** Core project record from `GET /projects` — no task-derived aggregates. */
export const ProjectRecordSchema = z.object({
  id: z.string(),
  code: z.string(),
  clientId: z.string(),
  client: ClientRefSchema,
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  projectLevel: z.number().int().min(1).max(4),
  department: z.enum(PROJECT_DEPARTMENTS),
  departmentHead: PersonWithCodeSchema,
  brief: z.string(),
  volume: z.number().int().min(1).max(4),
  nature: z.number().int().min(1).max(4),
  time: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  pm: PersonWithCodeSchema,
  evaluation: z.string(),
  note: z.string(),
  status: z.enum(PROJECT_STATUSES),
  urgency: z.enum(PROJECT_URGENCIES).optional(),
  finishedDate: z.string().optional(),
  updatedAt: z.string().optional(),
});

/** Optional list aggregates — backend may omit; UI defaults via `withProjectListDefaults`. */
export const ProjectListDerivedSchema = z.object({
  taskCount: z.number().int().min(0).optional(),
  members: z.array(PersonWithCodeSchema).optional(),
  totalSlides: z.number().int().min(0).optional(),
  completionPercent: z.number().min(0).max(100).optional(),
});

export const ProjectSchema = ProjectRecordSchema.merge(ProjectListDerivedSchema).extend({
  taskCount: z.number().int().min(0),
  members: z.array(PersonWithCodeSchema),
  totalSlides: z.number().int().min(0),
  completionPercent: z.number().min(0).max(100),
  urgency: z.enum(PROJECT_URGENCIES),
});

export const ProjectListFiltersSchema = z.object({
  search: z.string().optional(),
  clientId: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  pmCode: z.string().optional(),
  headName: z.string().optional(),
  projectLevel: z.number().int().min(1).max(4).optional(),
});

export const ProjectListResponseSchema = z.object({
  items: z.array(ProjectSchema),
  total: z.number(),
});

export const ProjectListRecordResponseSchema = z.object({
  items: z.array(ProjectRecordSchema.merge(ProjectListDerivedSchema)),
  total: z.number(),
});

export const UpdateProjectRequestSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Project name is required'),
  startDate: z.string(),
  endDate: z.string(),
  department: z.enum(PROJECT_DEPARTMENTS),
  departmentHead: PersonWithCodeSchema,
  brief: z.string(),
  volume: z.number().int().min(1).max(4),
  nature: z.number().int().min(1).max(4),
  time: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  pm: PersonWithCodeSchema,
  evaluation: z.string(),
  note: z.string(),
  status: z.enum(PROJECT_STATUSES),
});

export const CreateProjectRequestSchema = UpdateProjectRequestSchema;

export type PersonWithCode = z.infer<typeof PersonWithCodeSchema>;
export type ClientRef = z.infer<typeof ClientRefSchema>;
export type ProjectRecord = z.infer<typeof ProjectRecordSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectListFilters = z.infer<typeof ProjectListFiltersSchema>;
export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;
export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestSchema>;
export type CreateProjectRequest = z.infer<typeof CreateProjectRequestSchema>;
