import { resolveTaskType } from '@/features/task-scores/utils/resolveTaskType';
import type { TaskScore } from '@/features/task-scores/schemas/taskScore.schema';
import { toTaskDeadline } from './taskDates';
import { isStaffAssignable } from './staffAvailability';
import { resolveStaffFromUserId } from './staff';
import { computeTaskLevel } from './taskLevel';
import type { Dayjs } from 'dayjs';
import type {
  AssignDirection,
  CreateMyTaskRequest,
  TaskAssignee,
  TaskPerson,
  TaskWorkflowKind,
} from '../schemas/task.schema';

const DEFAULT_CLASSIFICATION = 1;

export class CreateTaskPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CreateTaskPayloadError';
  }
}

export interface CreateTaskFormSnapshot {
  projectName: string;
  projectManager: TaskPerson;
  taskScoreName?: string;
  quantity?: number;
  date: Dayjs;
  description?: string;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  assignDirection?: AssignDirection;
  staffUserId?: string;
  staffNote?: string;
}

export const resolveMatchedScore = (
  taskScoreName: string | undefined,
  scores: TaskScore[],
): TaskScore | undefined => {
  const normalized = taskScoreName?.trim().toLowerCase();
  if (!normalized) return undefined;
  return scores.find((score) => score.name.trim().toLowerCase() === normalized);
};

export const buildCreateTaskPayload = ({
  workflowKind,
  values,
  scores,
  staffOptions,
}: {
  workflowKind: TaskWorkflowKind;
  values: CreateTaskFormSnapshot;
  scores: TaskScore[];
  staffOptions: TaskAssignee[];
}): CreateMyTaskRequest => {
  const projectName = values.projectName?.trim();
  if (!projectName) {
    throw new CreateTaskPayloadError('Project name is required');
  }
  if (!values.projectManager?.code || !values.projectManager?.name) {
    throw new CreateTaskPayloadError('Project manager is required');
  }

  const matchedScore = resolveMatchedScore(values.taskScoreName, scores);
  if (!matchedScore) {
    throw new CreateTaskPayloadError('Select a task name from the list');
  }

  const isCreativeWorkflow = workflowKind === 'creative';
  const assignDirection: AssignDirection = isCreativeWorkflow
    ? 'creative_department'
    : (values.assignDirection ?? 'project_staff');

  if (!isCreativeWorkflow && !values.assignDirection) {
    throw new CreateTaskPayloadError('Chọn hướng assign');
  }

  const staff =
    assignDirection === 'project_staff'
      ? resolveStaffFromUserId(values.staffUserId, staffOptions)
      : [];

  if (assignDirection === 'project_staff') {
    const assignee = staff[0];
    if (!assignee) {
      throw new CreateTaskPayloadError('Chọn nhân viên nhận task');
    }
    if (!isStaffAssignable(assignee.availability)) {
      throw new CreateTaskPayloadError(
        'Không thể giao cho nhân viên Overloaded hoặc đang nghỉ phép',
      );
    }
  }

  const designThinking = isCreativeWorkflow ? DEFAULT_CLASSIFICATION : values.designThinking;
  const technical = isCreativeWorkflow ? DEFAULT_CLASSIFICATION : values.technical;
  const contentProcessing = isCreativeWorkflow ? DEFAULT_CLASSIFICATION : values.contentProcessing;

  if (
    designThinking == null ||
    technical == null ||
    contentProcessing == null ||
    designThinking < 1 ||
    technical < 1 ||
    contentProcessing < 1
  ) {
    throw new CreateTaskPayloadError('Phân loại đủ 3 tiêu chí độ khó');
  }

  const description = isCreativeWorkflow ? '' : (values.description ?? '').trim();
  const department = assignDirection === 'project_staff' ? 'project' : 'creative';

  return {
    taskCategory: 'project',
    projectName,
    projectManager: values.projectManager,
    taskName: resolveTaskType(matchedScore.taskType, matchedScore.name),
    level: isCreativeWorkflow
      ? DEFAULT_CLASSIFICATION
      : computeTaskLevel(designThinking, technical, contentProcessing),
    quantity: isCreativeWorkflow ? DEFAULT_CLASSIFICATION : (values.quantity ?? 1),
    date: toTaskDeadline(values.date),
    description,
    department,
    designThinking,
    technical,
    contentProcessing,
    additionalFactors: '',
    staff,
    staffConfirmation: 'not_updated',
    staffNote: values.staffNote ?? '',
    urgency: 'auto',
    workflowKind,
    assignDirection,
  };
};
