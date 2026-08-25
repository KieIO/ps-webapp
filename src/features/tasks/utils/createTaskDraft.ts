import dayjs, { type Dayjs } from 'dayjs';
import { defaultTaskDeadline } from './taskDates';

/** Normalized create-task form slice used for dirty detection. */
export type CreateTaskDraftSnapshot = {
  projectName: string;
  projectManagerCode: string;
  projectManagerName: string;
  taskScoreName: string;
  taskType: string;
  quantity: number;
  dateKey: string;
  description: string;
  designThinking: number | null;
  technical: number | null;
  contentProcessing: number | null;
  assignDirection: string;
  staffUserId: string;
  staffNote: string;
  urgency: string;
};

type DraftFormLike = {
  projectName?: string;
  projectManager?: { code?: string; name?: string; userId?: string };
  taskScoreName?: string;
  taskType?: string;
  quantity?: number;
  date?: Dayjs | null;
  description?: string;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  assignDirection?: string;
  staffUserId?: string;
  staffNote?: string;
  urgency?: string;
};

const normalizeText = (value: string | undefined | null): string => value?.trim() ?? '';

const normalizeOptionalNumber = (value: number | undefined): number | null =>
  value == null ? null : value;

const dateToKey = (value: Dayjs | null | undefined): string => {
  if (!value || !dayjs.isDayjs(value) || !value.isValid()) {
    return defaultTaskDeadline().endOf('day').toISOString();
  }
  return value.endOf('day').toISOString();
};

export const snapshotCreateTaskDraft = (values: DraftFormLike): CreateTaskDraftSnapshot => ({
  projectName: normalizeText(values.projectName),
  projectManagerCode: normalizeText(values.projectManager?.code),
  projectManagerName: normalizeText(values.projectManager?.name),
  taskScoreName: normalizeText(values.taskScoreName),
  taskType: normalizeText(values.taskType),
  quantity: values.quantity ?? 1,
  dateKey: dateToKey(values.date),
  description: normalizeText(values.description),
  designThinking: normalizeOptionalNumber(values.designThinking),
  technical: normalizeOptionalNumber(values.technical),
  contentProcessing: normalizeOptionalNumber(values.contentProcessing),
  assignDirection: normalizeText(values.assignDirection),
  staffUserId: normalizeText(values.staffUserId),
  staffNote: normalizeText(values.staffNote),
  urgency: normalizeText(values.urgency) || 'auto',
});

export const hasCreateTaskDraftChanges = (
  baseline: CreateTaskDraftSnapshot | null | undefined,
  current: CreateTaskDraftSnapshot,
): boolean => {
  if (!baseline) return false;
  return (Object.keys(baseline) as (keyof CreateTaskDraftSnapshot)[]).some(
    (key) => baseline[key] !== current[key],
  );
};
