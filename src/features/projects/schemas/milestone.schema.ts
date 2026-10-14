import { z } from 'zod';

export const MILESTONE_UNITS = ['slides', 'da'] as const;
export type MilestoneUnit = (typeof MILESTONE_UNITS)[number];

export const MILESTONE_UNIT_LABELS: Record<MilestoneUnit, string> = {
  slides: 'Slides',
  da: 'DA',
};

/** Milestone / deadline point on a project (ngày giao). */
export const ProjectMilestoneSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** Calendar date YYYY-MM-DD (or ISO; UI normalizes to date). */
  deadlineDate: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(MILESTONE_UNITS),
  note: z.string().optional().default(''),
});

/** Create/update payload item — `id` optional (server assigns when omitted). */
export const ProjectMilestoneInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tên mốc là bắt buộc'),
  deadlineDate: z.string().min(1, 'Ngày deadline là bắt buộc'),
  quantity: z.number().positive('Khối lượng phải lớn hơn 0'),
  unit: z.enum(MILESTONE_UNITS),
  note: z.string().optional().default(''),
});

export const ReplaceProjectMilestonesRequestSchema = z.object({
  milestones: z.array(ProjectMilestoneInputSchema),
});

export type ProjectMilestone = z.infer<typeof ProjectMilestoneSchema>;
export type ProjectMilestoneInput = z.infer<typeof ProjectMilestoneInputSchema>;
export type ReplaceProjectMilestonesRequest = z.infer<typeof ReplaceProjectMilestonesRequestSchema>;
