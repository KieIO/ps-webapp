import dayjs, { type Dayjs } from 'dayjs';
import {
  isSlidesOrDaUnit,
  type ProjectMilestone,
  type ProjectMilestoneInput,
} from '../schemas/milestone.schema';
import type { MilestoneFormRow } from '../components/ProjectMilestonesFields/ProjectMilestonesFields';
import { toMilestoneDateKey } from './milestoneValidation';

export const milestonesToFormRows = (
  milestones: readonly ProjectMilestone[] | undefined,
): MilestoneFormRow[] =>
  (milestones ?? []).map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
    deadlineDate: dayjs(milestone.deadlineDate),
    quantity: milestone.quantity ?? undefined,
    unit:
      isSlidesOrDaUnit(milestone.unit) || milestone.unit === 'others' ? milestone.unit : 'others',
    note: milestone.note ?? '',
    completed: Boolean(milestone.completed),
  }));

export const formRowsToMilestoneInputs = (
  rows: readonly MilestoneFormRow[] | undefined,
): ProjectMilestoneInput[] =>
  (rows ?? []).map((row) => {
    const unit = isSlidesOrDaUnit(row.unit) || row.unit === 'others' ? row.unit : 'others';
    const quantity =
      unit && row.quantity != null && !Number.isNaN(Number(row.quantity))
        ? Number(row.quantity)
        : null;
    return {
      id: row.id,
      name: row.name.trim(),
      deadlineDate: toMilestoneDateKey(
        dayjs.isDayjs(row.deadlineDate) ? row.deadlineDate.toISOString() : String(row.deadlineDate),
      ),
      quantity,
      unit,
      note: row.note?.trim() ?? '',
      completed: Boolean(row.completed),
    };
  });

export const resolveMilestoneFormBounds = (
  start: Dayjs | undefined,
  end: Dayjs | undefined,
): { startDate?: Dayjs; endDate?: Dayjs } => ({
  startDate: start,
  endDate: end,
});
