import { z } from 'zod';

export const MILESTONE_UNITS = ['others', 'slides', 'da'] as const;
export type MilestoneUnit = (typeof MILESTONE_UNITS)[number];

/** Wire unit: Others / Slides / DA, or empty string for older non-volume rows. */
export const MILESTONE_WIRE_UNITS = ['others', 'slides', 'da', ''] as const;
export type MilestoneWireUnit = (typeof MILESTONE_WIRE_UNITS)[number];

export const MILESTONE_UNIT_LABELS: Record<MilestoneUnit, string> = {
  others: 'Others',
  slides: 'Slides',
  da: 'DA',
};

export const isSlidesOrDaUnit = (unit: string | null | undefined): unit is 'slides' | 'da' =>
  unit === 'slides' || unit === 'da';

const normalizeUnit = (value: unknown): MilestoneWireUnit => {
  if (value === 'slides' || value === 'da' || value === 'others') return value;
  return '';
};

const normalizeQuantity = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const volumePairRefine = (
  value: { quantity?: number | null; unit?: string | null },
  ctx: z.RefinementCtx,
) => {
  const unit = value.unit ?? '';
  const hasVolumeUnit = isSlidesOrDaUnit(unit);
  if (hasVolumeUnit || (unit === 'others' && value.quantity != null)) {
    if (value.quantity == null || value.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Khối lượng phải lớn hơn 0',
        path: ['quantity'],
      });
      return;
    }
    if (!Number.isInteger(value.quantity)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Khối lượng phải là số nguyên',
        path: ['quantity'],
      });
    }
    return;
  }
  if (unit !== '' && unit !== 'others') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Đơn vị phải là Others, Slides, DA hoặc trống',
      path: ['unit'],
    });
  }
};

/** Milestone / deadline point on a project (ngày giao). */
export const ProjectMilestoneSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    /** Calendar date YYYY-MM-DD (or ISO; UI normalizes to date). */
    deadlineDate: z.string().min(1),
    /**
     * When true, deadline may fall outside the project Start–End range
     * (feedback / todo / note markers).
     */
    outsideTimeline: z.boolean().optional().default(false),
    /** Null when unit is empty (non-volume milestone). */
    quantity: z.preprocess(normalizeQuantity, z.number().positive().nullable()),
    /** `others` | `slides` | `da` | `""` */
    unit: z.preprocess(normalizeUnit, z.enum(MILESTONE_WIRE_UNITS)),
    note: z.string().optional().default(''),
    completed: z.boolean().optional().default(false),
    /** ISO timestamp when completed; omitted / null when incomplete. */
    completedAt: z.string().nullish(),
  })
  .superRefine(volumePairRefine);

/** Create/update payload item — `id` optional (server assigns when omitted). */
export const ProjectMilestoneInputSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Tên mốc là bắt buộc'),
    deadlineDate: z.string().min(1, 'Ngày deadline là bắt buộc'),
    outsideTimeline: z.boolean().optional().default(false),
    quantity: z.preprocess(normalizeQuantity, z.number().positive().nullable()),
    unit: z.preprocess(normalizeUnit, z.enum(MILESTONE_WIRE_UNITS)),
    note: z.string().optional().default(''),
    completed: z.boolean().optional().default(false),
  })
  .superRefine(volumePairRefine);

export const ReplaceProjectMilestonesRequestSchema = z.object({
  milestones: z.array(ProjectMilestoneInputSchema),
});

export type ProjectMilestone = z.infer<typeof ProjectMilestoneSchema>;
export type ProjectMilestoneInput = z.infer<typeof ProjectMilestoneInputSchema>;
export type ReplaceProjectMilestonesRequest = z.infer<typeof ReplaceProjectMilestonesRequestSchema>;

/** True when the milestone has a quantity to show (Slides, DA, or Others). */
export const hasMilestoneVolume = (
  milestone: Pick<ProjectMilestoneInput, 'quantity' | 'unit'>,
): boolean =>
  (isSlidesOrDaUnit(milestone.unit) || milestone.unit === 'others') && milestone.quantity != null;
