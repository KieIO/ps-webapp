import dayjs, { type Dayjs } from 'dayjs';
import type { ProjectMilestone, ProjectMilestoneInput } from '../schemas/milestone.schema';
import type { MilestoneFormRow } from '../components/ProjectMilestonesFields/ProjectMilestonesFields';
import { toMilestoneDateKey } from './milestoneValidation';

export const milestonesToFormRows = (
  milestones: readonly ProjectMilestone[] | undefined,
): MilestoneFormRow[] =>
  (milestones ?? []).map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
    deadlineDate: dayjs(milestone.deadlineDate),
    quantity: milestone.quantity,
    unit: milestone.unit,
    note: milestone.note ?? '',
  }));

export const formRowsToMilestoneInputs = (
  rows: readonly MilestoneFormRow[] | undefined,
): ProjectMilestoneInput[] =>
  (rows ?? []).map((row) => ({
    id: row.id,
    name: row.name.trim(),
    deadlineDate: toMilestoneDateKey(
      dayjs.isDayjs(row.deadlineDate) ? row.deadlineDate.toISOString() : String(row.deadlineDate),
    ),
    quantity: Number(row.quantity),
    unit: row.unit,
    note: row.note?.trim() ?? '',
  }));

export const resolveMilestoneFormBounds = (
  start: Dayjs | undefined,
  end: Dayjs | undefined,
): { startDate?: Dayjs; endDate?: Dayjs } => ({
  startDate: start,
  endDate: end,
});
