import { z } from 'zod';
import {
  dashboardCapacityBlockSchema,
  dashboardIsoDateSchema,
  dashboardOnTimeRateSchema,
  dashboardOutputSchema,
  dashboardOvertimeSchema,
  dashboardPeriodSchema,
  dashboardProductivityPointSchema,
} from '@/features/home/schemas/dashboardCommon.schema';

const weeklyOutputSchema = z.object({
  label: z.string(),
  startDate: dashboardIsoDateSchema,
  endDate: dashboardIsoDateSchema,
  projectSlides: z.number().min(0),
  creativeDa: z.number().min(0),
  editFeedback: z.number().min(0),
});

const weeklyOnTimeSchema = z.object({
  label: z.string(),
  startDate: dashboardIsoDateSchema,
  endDate: dashboardIsoDateSchema,
  percent: z.number().min(0).max(100).nullable(),
  finishedCount: z.number().int().min(0),
  onTimeCount: z.number().int().min(0),
});

const vsTargetSchema = z.object({
  available: z.boolean(),
  label: z.string(),
  message: z.string().optional(),
  percent: z.number().nullable().optional(),
  targetValue: z.number().nullable().optional(),
});

const rankingRowSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  department: z.string(),
  displayDepartment: z.string(),
  /** Primary PM for the period (majority of assigned project tasks). Empty when unknown. */
  pmName: z.string(),
  pmUserId: z.string().uuid().nullable(),
  /** Primary CM for Creative staff only (tasks.creative_manager_id). Empty when unset. */
  cmName: z.string(),
  cmUserId: z.string().uuid().nullable(),
  capacityPercent: z.number().min(0).nullable(),
  projectSlides: z.number().min(0),
  creativeDa: z.number().min(0),
  editFeedback: z.number().min(0),
  outputValue: z.number().min(0),
  outputUnit: z.string(),
  vsTarget: vsTargetSchema,
  onTimePercent: z.number().min(0).max(100).nullable(),
  onTimeFinished: z.number().int().min(0),
  onTimeOnTime: z.number().int().min(0),
  revisionPercent: z.number().min(0).max(100).nullable(),
  revisionReviewed: z.number().int().min(0),
  revisionRevised: z.number().int().min(0),
  qualityScore: z.number().min(0).max(100).nullable(),
  qualityReviewed: z.number().int().min(0),
  overtimeHours: z.number().min(0),
  trend: z.enum(['up', 'down', 'flat']),
  capacityDelta: z.number().nullable(),
});

export const ProductivityDashboardSchema = z.object({
  period: dashboardPeriodSchema,
  capacity: dashboardCapacityBlockSchema,
  output: dashboardOutputSchema,
  editFeedback: z.number().min(0),
  onTimeRate: dashboardOnTimeRateSchema,
  revisionRate: z.object({
    available: z.boolean(),
    percent: z.number().min(0).max(100).nullable(),
    reviewedCount: z.number().int().min(0),
    revisedCount: z.number().int().min(0),
    deltaPercent: z.number().nullable(),
    message: z.string().optional(),
  }),
  qualityScore: z.object({
    available: z.boolean(),
    average: z.number().min(0).max(100).nullable(),
    reviewCount: z.number().int().min(0),
    deltaAverage: z.number().nullable(),
    message: z.string().optional(),
  }),
  overtime: dashboardOvertimeSchema,
  weeklyOutput: z.array(weeklyOutputSchema),
  weeklyOnTime: z.array(weeklyOnTimeSchema),
  productivity: z.array(dashboardProductivityPointSchema),
});

export const ProductivityRankingSchema = z.object({
  ranking: z.array(rankingRowSchema),
});

export type ProductivityDashboard = z.infer<typeof ProductivityDashboardSchema>;
export type ProductivityRanking = z.infer<typeof ProductivityRankingSchema>;
export type ProductivityRankingRow = z.infer<typeof rankingRowSchema>;
export type ProductivityWeeklyOutput = z.infer<typeof weeklyOutputSchema>;
export type ProductivityWeeklyOnTime = z.infer<typeof weeklyOnTimeSchema>;
