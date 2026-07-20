import { z } from 'zod';

const nullablePercent = z.number().min(0).nullable();

export const EmployeePerformanceDetailSchema = z.object({
  period: z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    startDate: z.string(),
    endDate: z.string(),
  }),
  profile: z.object({
    userId: z.string().uuid(),
    name: z.string(),
    department: z.string(),
    displayDepartment: z.string(),
    jobTitleName: z.string(),
    jobLevelLabel: z.string(),
    joinedAt: z.string(),
  }),
  summary: z.object({
    capacityPercent: nullablePercent,
    capacityDelta: z.number().nullable(),
    output: z.object({
      value: z.number().min(0),
      unit: z.string(),
      projectSlides: z.number().min(0),
      creativeDa: z.number().min(0),
      editFeedback: z.number().min(0),
    }),
    qualityScore: z.object({
      average: nullablePercent,
      reviewCount: z.number().int().min(0),
      deltaAverage: z.number().nullable(),
    }),
    onTimeRate: z.object({
      percent: nullablePercent,
      finishedCount: z.number().int().min(0),
      onTimeCount: z.number().int().min(0),
    }),
    revisionRate: z.object({
      percent: nullablePercent,
      reviewedCount: z.number().int().min(0),
      revisedCount: z.number().int().min(0),
    }),
    avgTaskLevel: z.number().min(0).nullable(),
    creativeDa: z.object({
      assigned: z.number().min(0),
      approved: z.number().min(0),
    }),
  }),
  qualityScoreTrend: z.array(
    z.object({
      year: z.number().int(),
      month: z.number().int(),
      label: z.string(),
      average: nullablePercent,
      reviewCount: z.number().int().min(0),
    }),
  ),
  capacityTrend: z.array(
    z.object({
      year: z.number().int(),
      month: z.number().int(),
      label: z.string(),
      capacityPercent: nullablePercent,
    }),
  ),
  recentTasks: z.array(
    z.object({
      taskId: z.string().uuid(),
      taskCode: z.string(),
      taskName: z.string(),
      level: z.number().min(0),
      quantity: z.number().min(0),
      revisionCount: z.number().int().min(0).nullable(),
      qualityScore: nullablePercent,
      completedAt: z.string().nullable(),
      onTime: z.boolean().nullable(),
    }),
  ),
  comments: z.array(
    z.object({
      id: z.string().uuid(),
      taskCode: z.string(),
      reviewerName: z.string(),
      reviewerRole: z.string(),
      comment: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export type EmployeePerformanceDetail = z.infer<typeof EmployeePerformanceDetailSchema>;
export type EmployeeRecentTask = EmployeePerformanceDetail['recentTasks'][number];
export type EmployeePerformanceComment = EmployeePerformanceDetail['comments'][number];
