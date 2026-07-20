import { z } from 'zod';

export const CapacityBreakdownScopeSchema = z.enum(['company', 'project', 'creative']);
export type CapacityBreakdownScope = z.infer<typeof CapacityBreakdownScopeSchema>;

export const CapacityBreakdownStaffItemSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
  department: z.string(),
  jobTitleName: z.string(),
  dailyCapacityPoints: z.number().int().min(0),
  monthlyCapacityPoints: z.number().int().min(0),
  workloadPoints: z.number().min(0),
});

export const CapacityBreakdownPageSchema = z.object({
  scope: CapacityBreakdownScopeSchema,
  available: z.boolean(),
  workingDays: z.number().int().min(0),
  workloadPoints: z.number().min(0),
  dailyCapacityPoints: z.number().int().min(0),
  availableCapacityPoints: z.number().int().min(0),
  staff: z.object({
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    items: z.array(CapacityBreakdownStaffItemSchema),
  }),
});

export const CapacityBreakdownTaskSchema = z.object({
  taskName: z.string(),
  level: z.number().int().min(1).max(5),
  quantity: z.number().min(0),
  score: z.number().int().min(0),
  points: z.number().min(0),
});

export const CapacityBreakdownStaffTasksSchema = z.object({
  userId: z.string().uuid(),
  workingDays: z.number().int().min(0),
  dailyCapacityPoints: z.number().int().min(0),
  monthlyCapacityPoints: z.number().int().min(0),
  workloadPoints: z.number().min(0),
  tasks: z.array(CapacityBreakdownTaskSchema),
});

export type CapacityBreakdownPage = z.infer<typeof CapacityBreakdownPageSchema>;
export type CapacityBreakdownStaffItem = z.infer<typeof CapacityBreakdownStaffItemSchema>;
export type CapacityBreakdownStaffTasks = z.infer<typeof CapacityBreakdownStaffTasksSchema>;
