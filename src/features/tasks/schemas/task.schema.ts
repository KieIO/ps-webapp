/**
 * Zod schemas for My Tasks API responses.
 * Backend contract: docs/MY_TASKS_BACKEND_TODO.md (index: docs/BACKEND_API.md)
 */
import { z } from 'zod';
import {
  PROJECT_DEPARTMENTS,
  PROJECT_STATUSES,
  PROJECT_URGENCIES,
} from '@/features/projects/schemas/project.schema';

export const CLASSIFICATION_LEVELS = [1, 2, 3, 4] as const;

export const TASK_CATEGORIES = ['project', 'non_project'] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_DEPARTMENTS = PROJECT_DEPARTMENTS;

export type TaskDepartment = (typeof TASK_DEPARTMENTS)[number];

export const TASK_CONFIRMATION_STATUSES = [
  'not_updated',
  'finished',
  'confirmed',
  'decline',
] as const;

export type ClassificationLevel = (typeof CLASSIFICATION_LEVELS)[number];
export type TaskConfirmationStatus = (typeof TASK_CONFIRMATION_STATUSES)[number];

export const TaskPersonSchema = z.object({
  code: z.string(),
  name: z.string(),
  userId: z.string().nullish(),
});

export const TaskAssigneeSchema = TaskPersonSchema.extend({
  userId: z.string().nullish(),
});

export const MyTaskSchema = z.object({
  id: z.string(),
  taskCategory: z.enum(TASK_CATEGORIES),
  taskCode: z.string(),
  /** Linked project record id — present for project tasks when API provides it. */
  projectId: z.string().nullish(),
  projectName: z.string(),
  projectManager: TaskPersonSchema,
  taskName: z.string(),
  level: z.number().int().min(1).max(4),
  quantity: z.number().int().min(0),
  /** UTC start of the task calendar day (00:00:00). */
  date: z.string(),
  /** UTC end of the task calendar day (23:59:59), when provided by API. */
  deadline: z.string().nullish(),
  description: z.string(),
  staff: z.array(TaskAssigneeSchema),
  /** Phòng ban of the task — required for new project tasks. */
  department: z.enum(TASK_DEPARTMENTS).nullish(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  completionPercent: z.number().min(0).max(100).nullish(),
  pmEvaluation: z.string(),
  pmNote: z.string(),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  /** Stored setting — `auto` lets the API/UI derive display color from deadline. */
  urgency: z.enum(PROJECT_URGENCIES).optional().default('auto'),
  updatedAt: z.string().nullish(),
  /** Denormalized project fields — populated by API or mock for Department Head columns. */
  projectStartDate: z.string().nullish(),
  projectEndDate: z.string().nullish(),
  projectLevel: z.number().int().min(1).max(4).nullish(),
  projectBrief: z.string().nullish(),
  projectVolume: z.number().int().min(1).max(4).nullish(),
  projectNature: z.number().int().min(1).max(4).nullish(),
  projectTime: z.number().int().min(1).max(4).nullish(),
  projectStatus: z.enum(PROJECT_STATUSES).nullish(),
  projectFinishedDate: z.string().nullish(),
});

export const MyTaskListFiltersSchema = z.object({
  taskCategory: z.enum(TASK_CATEGORIES).optional(),
  search: z.string().optional(),
  projectName: z.string().optional(),
  staffName: z.string().optional(),
  confirmation: z.enum(TASK_CONFIRMATION_STATUSES).optional(),
});

export const MyTaskListResponseSchema = z.object({
  items: z.array(MyTaskSchema),
  total: z.number(),
});

export const TASK_HISTORY_KINDS = ['event', 'deadline'] as const;

export const TaskHistoryEventSchema = z.object({
  id: z.string(),
  occurredAt: z.string(),
  description: z.string(),
  completed: z.boolean(),
  kind: z.enum(TASK_HISTORY_KINDS),
});

export const TaskHistoryListResponseSchema = z.object({
  items: z.array(TaskHistoryEventSchema),
});

export const CreateMyTaskRequestSchema = z.object({
  taskCategory: z.enum(TASK_CATEGORIES),
  projectName: z.string().min(1, 'Project name is required'),
  projectManager: TaskPersonSchema,
  taskName: z.string().min(1, 'Task name is required'),
  level: z.number().int().min(1).max(4),
  quantity: z.number().int().min(0),
  date: z.string(),
  description: z.string(),
  department: z.enum(TASK_DEPARTMENTS).optional(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  staff: z.array(TaskAssigneeSchema),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  /** Persisted urgency — defaults from deadline when omitted on create. */
  urgency: z.enum(PROJECT_URGENCIES),
});

export const UpdateMyTaskStatusRequestSchema = z.object({
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
});

export const UpdateMyTaskPmEvaluationRequestSchema = z.object({
  completionPercent: z.number().min(0).max(100),
  pmEvaluation: z.string(),
  pmNote: z.string(),
});

export const AssignMyTaskRequestSchema = z.object({
  staff: z.array(TaskAssigneeSchema).min(1, 'Select at least one staff member'),
  staffNote: z.string(),
});

export const UpdateMyTaskRequestSchema = z.object({
  taskName: z.string().min(1, 'Task name is required'),
  quantity: z.number().int().min(0),
  date: z.string(),
  description: z.string(),
  designThinking: z.number().int().min(1).max(4),
  technical: z.number().int().min(1).max(4),
  contentProcessing: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  staff: z.array(TaskAssigneeSchema),
  staffConfirmation: z.enum(TASK_CONFIRMATION_STATUSES),
  staffNote: z.string(),
  urgency: z.enum(PROJECT_URGENCIES),
});

/** Department Head — project-context fields on task rows (non-project or when no linked project). */
export const UpdateHeadMyTaskRequestSchema = z.object({
  projectStartDate: z.string(),
  projectEndDate: z.string(),
  projectBrief: z.string(),
  projectVolume: z.number().int().min(1).max(4),
  projectNature: z.number().int().min(1).max(4),
  projectTime: z.number().int().min(1).max(4),
  additionalFactors: z.string(),
  pmEvaluation: z.string(),
  pmNote: z.string(),
  projectStatus: z.enum(PROJECT_STATUSES),
  projectFinishedDate: z.string().optional(),
  /** Task urgency (independent from project.urgency). */
  urgency: z.enum(PROJECT_URGENCIES),
});

export type TaskPerson = z.infer<typeof TaskPersonSchema>;
export type TaskAssignee = z.infer<typeof TaskAssigneeSchema>;
export type MyTask = z.infer<typeof MyTaskSchema>;
export type MyTaskListFilters = z.infer<typeof MyTaskListFiltersSchema>;
export type MyTaskListResponse = z.infer<typeof MyTaskListResponseSchema>;
export type TaskHistoryEvent = z.infer<typeof TaskHistoryEventSchema>;
export type TaskHistoryListResponse = z.infer<typeof TaskHistoryListResponseSchema>;
export type CreateMyTaskRequest = z.infer<typeof CreateMyTaskRequestSchema>;
export type UpdateMyTaskStatusRequest = z.infer<typeof UpdateMyTaskStatusRequestSchema>;
export type UpdateMyTaskPmEvaluationRequest = z.infer<typeof UpdateMyTaskPmEvaluationRequestSchema>;
export type AssignMyTaskRequest = z.infer<typeof AssignMyTaskRequestSchema>;
export type UpdateMyTaskRequest = z.infer<typeof UpdateMyTaskRequestSchema>;
export type UpdateHeadMyTaskRequest = z.infer<typeof UpdateHeadMyTaskRequestSchema>;
