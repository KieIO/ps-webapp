import { z } from 'zod';

const OnTimeRateSchema = z.object({
  available: z.boolean(),
  currentPercent: z.number().nullable(),
  previousPercent: z.number().nullable(),
  deltaPercent: z.number().nullable(),
  periodKey: z.string(),
  finishedCount: z.number().int(),
  onTimeCount: z.number().int(),
});

const WeeklyCompletedSchema = z.object({
  completedCount: z.number().int(),
  assignedCount: z.number().int(),
  remainingCount: z.number().int(),
  percent: z.number().int(),
  weekStart: z.string(),
  weekEnd: z.string(),
});

const RevisionRateSchema = z.object({
  available: z.boolean(),
  currentPercent: z.number().nullable(),
  previousPercent: z.number().nullable(),
  deltaPercent: z.number().nullable(),
  periodKey: z.string(),
  reviewedCount: z.number().int(),
  revisedCount: z.number().int(),
  message: z.string().optional().default(''),
});

export const EmployeeProductivitySchema = z.object({
  onTimeRate: OnTimeRateSchema,
  weeklyCompleted: WeeklyCompletedSchema,
  revisionRate: RevisionRateSchema,
});

export type EmployeeProductivity = z.infer<typeof EmployeeProductivitySchema>;
export type OnTimeRateMetrics = z.infer<typeof OnTimeRateSchema>;
export type WeeklyCompletedMetrics = z.infer<typeof WeeklyCompletedSchema>;
export type RevisionRateMetrics = z.infer<typeof RevisionRateSchema>;
