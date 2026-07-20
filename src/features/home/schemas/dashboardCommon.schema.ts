import { z } from 'zod';

/** Shared ISO date used by overall / productivity dashboard schemas. */
export const dashboardIsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dashboardCapacityDetailSchema = z.object({
  workloadPoints: z.number().min(0),
  availableCapacityPoints: z.number().int().min(0),
});

export const dashboardWeeklyCapacitySchema = z.object({
  label: z.string(),
  startDate: dashboardIsoDateSchema,
  endDate: dashboardIsoDateSchema,
  company: z.number().min(0),
  project: z.number().min(0),
  creative: z.number().min(0),
  companyDetail: dashboardCapacityDetailSchema,
  projectDetail: dashboardCapacityDetailSchema,
  creativeDetail: dashboardCapacityDetailSchema,
});

export const dashboardProductivityPointSchema = z.object({
  label: z.string(),
  startDate: dashboardIsoDateSchema,
  endDate: dashboardIsoDateSchema,
  projectPercent: z.number().min(0),
  creativePercent: z.number().min(0),
  projectCompleted: z.number().int().min(0),
  projectAssigned: z.number().int().min(0),
  creativeCompleted: z.number().int().min(0),
  creativeAssigned: z.number().int().min(0),
});

export const dashboardPeriodSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  startDate: dashboardIsoDateSchema,
  endDate: dashboardIsoDateSchema,
});

export const dashboardCapacityBlockSchema = z.object({
  available: z.boolean(),
  company: z.number().min(0),
  project: z.number().min(0),
  creative: z.number().min(0),
  weekly: z.array(dashboardWeeklyCapacitySchema),
  details: z.object({
    company: dashboardCapacityDetailSchema,
    project: dashboardCapacityDetailSchema,
    creative: dashboardCapacityDetailSchema,
  }),
});

export const dashboardOutputSchema = z.object({
  projectSlides: z.number().min(0),
  creativeDa: z.number().min(0),
});

export const dashboardOnTimeRateSchema = z.object({
  available: z.boolean(),
  percent: z.number().min(0).max(100).nullable(),
  finishedCount: z.number().int().min(0),
  onTimeCount: z.number().int().min(0),
});

export const dashboardOvertimeSchema = z.object({
  available: z.boolean(),
  totalHours: z.number().min(0),
  requestCount: z.number().int().min(0),
  basis: z.literal('approved_estimate'),
});
