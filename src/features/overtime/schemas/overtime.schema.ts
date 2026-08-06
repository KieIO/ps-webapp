import { z } from 'zod';

export const OVERTIME_STATUSES = [
  'pending',
  'rejected',
  'approved',
  'in_progress',
  'awaiting_review',
  'completed',
] as const;

export type OvertimeStatus = (typeof OVERTIME_STATUSES)[number];

export const OvertimePersonSchema = z.object({
  userId: z.string(),
  code: z.string().optional().default(''),
  name: z.string().optional().default(''),
});

export const OvertimeProjectSchema = z.object({
  id: z.string(),
  code: z.string().optional().default(''),
  name: z.string().optional().default(''),
});

export const OvertimeTaskSchema = z.object({
  id: z.string(),
  name: z.string().optional().default(''),
});

export const OvertimeRecordSchema = z.object({
  id: z.string(),
  requestedBy: OvertimePersonSchema,
  assignee: OvertimePersonSchema,
  project: OvertimeProjectSchema,
  task: OvertimeTaskSchema.nullish(),
  otDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  estimatedHours: z.number(),
  actualHours: z.number().nullish(),
  reason: z.string(),
  taskName: z.string().optional().default(''),
  staffNote: z.string().optional().default(''),
  status: z.enum(OVERTIME_STATUSES),
  approvedBy: OvertimePersonSchema.nullish(),
  approvedAt: z.string().nullish(),
  rejectReason: z.string().optional().default(''),
  resultApproved: z.boolean().nullish(),
  resultReviewNote: z.string().optional().default(''),
  resultReviewedAt: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OvertimeListFiltersSchema = z.object({
  status: z.enum(OVERTIME_STATUSES).optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().optional(),
});

export const CreateOvertimeRequestSchema = z.object({
  projectId: z.string().min(1),
  assigneeId: z.string().min(1),
  otDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  estimatedHours: z.number().positive(),
  reason: z.string().min(1),
});

export const RejectOvertimeRequestSchema = z.object({
  reason: z.string().min(1),
});

export const AssignOtTaskRequestSchema = z.object({
  taskId: z.string().uuid(),
});

export const AssignableOtTaskSchema = z.object({
  id: z.string(),
  taskCode: z.string(),
  taskName: z.string(),
  staffConfirmation: z.string(),
  staffName: z.string().optional().default(''),
  date: z.string().optional().default(''),
  urgency: z.string().optional().default(''),
});

export const ReviewOtResultRequestSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional().default(''),
});

export const OvertimeSettingsSchema = z.object({
  alertThresholdHoursPerWeek: z.number().positive(),
});

export const OvertimeDashboardPersonSchema = z.object({
  assignee: OvertimePersonSchema,
  estimatedHours: z.number(),
  actualHours: z.number(),
  requestCount: z.number(),
});

export const OvertimeDashboardProjectSchema = z.object({
  project: OvertimeProjectSchema,
  estimatedHours: z.number(),
  actualHours: z.number(),
  requestCount: z.number(),
});

export const OvertimeDashboardTrendSchema = z.object({
  weekStart: z.string(),
  estimatedHours: z.number(),
  actualHours: z.number(),
  requestCount: z.number(),
});

export const OvertimeDashboardAlertSchema = z.object({
  assignee: OvertimePersonSchema,
  weekStart: z.string(),
  weekEnd: z.string(),
  estimatedHours: z.number(),
  threshold: z.number(),
});

export const OvertimeDashboardSchema = z.object({
  year: z.number(),
  month: z.number(),
  threshold: z.number(),
  byPerson: z.array(OvertimeDashboardPersonSchema),
  byProject: z.array(OvertimeDashboardProjectSchema),
  trend: z.array(OvertimeDashboardTrendSchema),
  alerts: z.array(OvertimeDashboardAlertSchema),
});

export type OvertimePerson = z.infer<typeof OvertimePersonSchema>;
export type OvertimeProject = z.infer<typeof OvertimeProjectSchema>;
export type OvertimeRecord = z.infer<typeof OvertimeRecordSchema>;
export type OvertimeListFilters = z.infer<typeof OvertimeListFiltersSchema>;
export type CreateOvertimeRequest = z.infer<typeof CreateOvertimeRequestSchema>;
export type RejectOvertimeRequest = z.infer<typeof RejectOvertimeRequestSchema>;
export type AssignOtTaskRequest = z.infer<typeof AssignOtTaskRequestSchema>;
export type AssignableOtTask = z.infer<typeof AssignableOtTaskSchema>;
export type ReviewOtResultRequest = z.infer<typeof ReviewOtResultRequestSchema>;
export type OvertimeSettings = z.infer<typeof OvertimeSettingsSchema>;
export type OvertimeDashboard = z.infer<typeof OvertimeDashboardSchema>;
export type OvertimeDashboardPerson = z.infer<typeof OvertimeDashboardPersonSchema>;
export type OvertimeDashboardProject = z.infer<typeof OvertimeDashboardProjectSchema>;
export type OvertimeDashboardAlert = z.infer<typeof OvertimeDashboardAlertSchema>;
export type OvertimeDashboardTrend = z.infer<typeof OvertimeDashboardTrendSchema>;
