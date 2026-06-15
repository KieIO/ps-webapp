import { z } from 'zod';
import { USER_DEPARTMENTS } from '@/features/users/constants';

export const CAPACITY_MONTHLY_ROW_KEYS = ['total', ...USER_DEPARTMENTS] as const;

export type CapacityMonthlyRowKey = (typeof CAPACITY_MONTHLY_ROW_KEYS)[number];

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CapacityMonthlyMonthFiltersSchema = z.object({
  mode: z.literal('month'),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const CapacityMonthlyRangeFiltersSchema = z.object({
  mode: z.literal('range'),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
});

export const CapacityMonthlyFiltersSchema = z.discriminatedUnion('mode', [
  CapacityMonthlyMonthFiltersSchema,
  CapacityMonthlyRangeFiltersSchema,
]);

const departmentMetricsSchema = z.object({
  total: z.number().min(0),
  project: z.number().min(0),
  creative_hcm: z.number().min(0),
  creative_ag: z.number().min(0),
});

export const CapacityMonthlyDaySchema = z.object({
  date: isoDateSchema,
  dayOfMonth: z.number().int().min(1).max(31),
  isWeekend: z.boolean(),
  hasData: z.boolean(),
  hasSlidesData: z.boolean(),
  capacity: departmentMetricsSchema,
  slides: departmentMetricsSchema,
});

export const CapacityMonthlySummarySchema = z.object({
  totalProjects: z.number().min(0),
  totalSlides: z.number().min(0),
  workingDays: z.number().min(0),
  dayCount: z.number().min(0),
});

export const CapacityMonthlyResponseSchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  year: z.number().int(),
  month: z.number().int(),
  summary: CapacityMonthlySummarySchema,
  days: z.array(CapacityMonthlyDaySchema),
});

export type CapacityMonthlyFilters = z.infer<typeof CapacityMonthlyFiltersSchema>;
export type CapacityMonthlyDay = z.infer<typeof CapacityMonthlyDaySchema>;
export type CapacityMonthlySummary = z.infer<typeof CapacityMonthlySummarySchema>;
export type CapacityMonthlyResponse = z.infer<typeof CapacityMonthlyResponseSchema>;
