import { mockDelay } from '@/shared/mock/mockDelay';
import type {
  CreateTaskScoreRequest,
  TaskScore,
  TaskScoreListFilters,
  TaskScoreListResponse,
  UpdateTaskScoreRequest,
} from '../schemas/taskScore.schema';
import {
  buildTaskScoreGroupSortOrder,
  compareTaskScores,
  getNextTaskScoreSortOrder,
} from '../utils/sortTaskScores';
import { getTaskScoreGroupByCode } from './taskScoreGroups.mock';
import { getMockTaskScoreGroupsStore } from './taskScoreGroups.data';
import { getMockTaskScoresStore, setMockTaskScoresStore } from './taskScores.data';

const assertGroupExists = (code: string) => {
  if (!getTaskScoreGroupByCode(code)) {
    throw new Error('Selected group does not exist');
  }
};

const filterTaskScores = (items: TaskScore[], filters: TaskScoreListFilters): TaskScore[] => {
  const search = filters.search?.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.group && item.group !== filters.group) return false;
    if (search && !item.name.toLowerCase().includes(search)) return false;
    return true;
  });
};

export const mockGetTaskScoreList = async (
  filters: TaskScoreListFilters,
): Promise<TaskScoreListResponse> => {
  await mockDelay();
  const groupSortOrder = buildTaskScoreGroupSortOrder(getMockTaskScoreGroupsStore());
  const items = filterTaskScores(getMockTaskScoresStore(), filters).sort((a, b) =>
    compareTaskScores(a, b, groupSortOrder),
  );
  return { items, total: items.length };
};

export const mockCreateTaskScore = async (payload: CreateTaskScoreRequest): Promise<TaskScore> => {
  await mockDelay();

  const name = payload.name.trim();
  assertGroupExists(payload.group);
  const items = getMockTaskScoresStore();
  const duplicate = items.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    throw new Error('A task with this name already exists');
  }

  const created: TaskScore = {
    id: `task-score-${Date.now()}`,
    name,
    taskType: payload.taskType,
    score: payload.score,
    group: payload.group,
    sortOrder: getNextTaskScoreSortOrder(items),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setMockTaskScoresStore([...items, created]);
  return created;
};

export const mockUpdateTaskScore = async (
  id: string,
  payload: UpdateTaskScoreRequest,
): Promise<TaskScore> => {
  await mockDelay();

  const name = payload.name.trim();
  assertGroupExists(payload.group);
  const items = getMockTaskScoresStore();
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) {
    throw new Error('Task not found');
  }

  const duplicate = items.find(
    (entry) => entry.id !== id && entry.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('A task with this name already exists');
  }

  const updated: TaskScore = {
    ...items[index],
    name,
    taskType: payload.taskType,
    score: payload.score,
    group: payload.group,
    updatedAt: new Date().toISOString(),
  };

  const next = [...items];
  next[index] = updated;
  setMockTaskScoresStore(next);
  return updated;
};
