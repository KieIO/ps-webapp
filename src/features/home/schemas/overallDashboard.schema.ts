import { z } from 'zod';
import {
  dashboardCapacityBlockSchema,
  dashboardOnTimeRateSchema,
  dashboardOutputSchema,
  dashboardOvertimeSchema,
  dashboardPeriodSchema,
  dashboardProductivityPointSchema,
  dashboardWeeklyCapacitySchema,
} from './dashboardCommon.schema';

export const OverallDashboardSchema = z.object({
  period: dashboardPeriodSchema,
  capacity: dashboardCapacityBlockSchema,
  output: dashboardOutputSchema,
  onTimeRate: dashboardOnTimeRateSchema,
  overtime: dashboardOvertimeSchema,
  productivity: z.array(dashboardProductivityPointSchema),
});

export type OverallDashboard = z.infer<typeof OverallDashboardSchema>;
export type OverallWeeklyCapacity = z.infer<typeof dashboardWeeklyCapacitySchema>;
export type OverallProductivityPoint = z.infer<typeof dashboardProductivityPointSchema>;
