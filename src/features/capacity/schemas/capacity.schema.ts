import { z } from 'zod';
import { USER_DEPARTMENTS } from '@/features/users/constants';
import { JOB_LEVELS, WORK_STATUSES } from '../constants';
import {
  CapacityMonthlyMonthFiltersSchema,
  CapacityMonthlyRangeFiltersSchema,
} from './capacityMonthly.schema';

export const EmployeeCapacitySchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.enum(USER_DEPARTMENTS),
  jobLevel: z.enum(JOB_LEVELS),
  positionCode: z.string(),
  jobTitleName: z.string(),
  workStatus: z.enum(WORK_STATUSES),
  /** Daily capacity limit from job title (points/day). */
  dailyCapacityPoints: z.number().min(0),
  /** Specialist task points from job title (Điểm task CM). */
  specialistTaskPoints: z.number().min(0),
  /** Sum of task score × quantity for the selected period. */
  achievedTaskPoints: z.number().min(0),
  /** Utilization % for today; null when off or not yet calculated. */
  capacityPercent: z.number().min(0).nullable(),
});

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const capacityListSharedFields = {
  department: z.enum(USER_DEPARTMENTS).optional(),
  workStatus: z.enum(WORK_STATUSES).optional(),
};

export const CapacityListMonthFiltersSchema = CapacityMonthlyMonthFiltersSchema.extend(
  capacityListSharedFields,
);

export const CapacityListRangeFiltersSchema = CapacityMonthlyRangeFiltersSchema.extend(
  capacityListSharedFields,
);

export const CapacityListDateFiltersSchema = z.object({
  mode: z.literal('date'),
  date: isoDateSchema,
  department: z.enum(USER_DEPARTMENTS).optional(),
  workStatus: z.enum(WORK_STATUSES).optional(),
});

export const CapacityListFiltersSchema = z.discriminatedUnion('mode', [
  CapacityListMonthFiltersSchema,
  CapacityListRangeFiltersSchema,
  CapacityListDateFiltersSchema,
]);

export const CapacityListResponseSchema = z.object({
  items: z.array(EmployeeCapacitySchema),
  total: z.number(),
  /** Weighted team average for the selected period (total workload / total capacity). */
  averageCapacityPercent: z.number().min(0),
});

export type EmployeeCapacity = z.infer<typeof EmployeeCapacitySchema>;
export type CapacityListFilters = z.infer<typeof CapacityListFiltersSchema>;
export type CapacityListResponse = z.infer<typeof CapacityListResponseSchema>;
