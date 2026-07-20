import { z } from 'zod';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

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

const capacityStaffSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  department: z.string(),
  displayDepartment: z.string(),
  capacityPercent: z.number().min(0).nullable(),
  overloaded: z.boolean(),
  workStatus: z.string(),
});

const alertSchema = z.object({
  type: z.string(),
  title: z.string(),
  body: z.string(),
  userId: z.string().uuid().nullable().optional(),
  severity: z.enum(['warning', 'info', 'error']).or(z.string()),
});

export const TeamProductivitySchema = z.object({
  period: z.object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
  }),
  role: z.string(),
  teamSize: z.number().int().min(0),
  capacityPercent: z.number().min(0).nullable(),
  overloadedCount: z.number().int().min(0),
  output: z.object({
    projectSlides: z.number().min(0),
    creativeDa: z.number().min(0),
  }),
  editFeedback: z.number().min(0),
  onTimeRate: z.object({
    available: z.boolean(),
    percent: z.number().min(0).max(100).nullable(),
    finishedCount: z.number().int().min(0),
    onTimeCount: z.number().int().min(0),
  }),
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
  overtime: z.object({
    available: z.boolean(),
    totalHours: z.number().min(0),
    requestCount: z.number().int().min(0),
    basis: z.literal('approved_estimate'),
  }),
  capacityByStaff: z.array(capacityStaffSchema),
  ranking: z.array(rankingRowSchema),
  alerts: z.array(alertSchema),
  vsTarget: vsTargetSchema,
});

export type TeamProductivity = z.infer<typeof TeamProductivitySchema>;
export type TeamCapacityStaff = z.infer<typeof capacityStaffSchema>;
export type TeamAlert = z.infer<typeof alertSchema>;
