import { z } from 'zod';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const capacityDetailSchema = z.object({
  workloadPoints: z.number().min(0),
  availableCapacityPoints: z.number().int().min(0),
});

const weeklyCapacitySchema = z.object({
  label: z.string(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  company: z.number().min(0),
  project: z.number().min(0),
  creative: z.number().min(0),
  companyDetail: capacityDetailSchema,
  projectDetail: capacityDetailSchema,
  creativeDetail: capacityDetailSchema,
});

const productivityPointSchema = z.object({
  label: z.string(),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  projectPercent: z.number().min(0),
  creativePercent: z.number().min(0),
  projectCompleted: z.number().int().min(0),
  projectAssigned: z.number().int().min(0),
  creativeCompleted: z.number().int().min(0),
  creativeAssigned: z.number().int().min(0),
});

export const OverallDashboardSchema = z.object({
  period: z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
  }),
  capacity: z.object({
    available: z.boolean(),
    company: z.number().min(0),
    project: z.number().min(0),
    creative: z.number().min(0),
    weekly: z.array(weeklyCapacitySchema),
    details: z.object({
      company: capacityDetailSchema,
      project: capacityDetailSchema,
      creative: capacityDetailSchema,
    }),
  }),
  output: z.object({
    projectSlides: z.number().min(0),
    creativeDa: z.number().min(0),
  }),
  onTimeRate: z.object({
    available: z.boolean(),
    percent: z.number().min(0).max(100).nullable(),
    finishedCount: z.number().int().min(0),
    onTimeCount: z.number().int().min(0),
  }),
  overtime: z.object({
    available: z.boolean(),
    totalHours: z.number().min(0),
    requestCount: z.number().int().min(0),
    basis: z.literal('approved_estimate'),
  }),
  productivity: z.array(productivityPointSchema),
});

export type OverallDashboard = z.infer<typeof OverallDashboardSchema>;
export type OverallWeeklyCapacity = z.infer<typeof weeklyCapacitySchema>;
export type OverallProductivityPoint = z.infer<typeof productivityPointSchema>;
