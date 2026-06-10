import { mockDelay } from '@/shared/mock/mockDelay';
import { pickTaskScoreGroupColorKey, slugifyTaskScoreGroupCode } from '../constants';
import type {
  CreateTaskScoreGroupRequest,
  TaskScoreGroupListResponse,
  TaskScoreGroupRecord,
} from '../schemas/taskScoreGroup.schema';
import { getMockTaskScoresStore } from './taskScores.data';
import {
  getMockTaskScoreGroupsStore,
  setMockTaskScoreGroupsStore,
} from './taskScoreGroups.data';

export const mockGetTaskScoreGroupList = async (): Promise<TaskScoreGroupListResponse> => {
  await mockDelay();
  const items = [...getMockTaskScoreGroupsStore()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
  );
  return { items, total: items.length };
};

export const mockCreateTaskScoreGroup = async (
  payload: CreateTaskScoreGroupRequest,
): Promise<TaskScoreGroupRecord> => {
  await mockDelay();

  const label = payload.label.trim();
  const groups = getMockTaskScoreGroupsStore();
  const code = slugifyTaskScoreGroupCode(label);
  const duplicate = groups.find(
    (entry) =>
      entry.code === code || entry.label.toLowerCase() === label.toLowerCase(),
  );
  if (duplicate) {
    throw new Error('A group with this name already exists');
  }

  const created: TaskScoreGroupRecord = {
    id: `task-group-${Date.now()}`,
    code,
    label,
    colorKey: pickTaskScoreGroupColorKey(groups.length),
    sortOrder: groups.reduce((max, entry) => Math.max(max, entry.sortOrder), -1) + 1,
    createdAt: new Date().toISOString(),
  };

  setMockTaskScoreGroupsStore([...groups, created]);
  return created;
};

export const getTaskScoreGroupByCode = (code: string): TaskScoreGroupRecord | undefined =>
  getMockTaskScoreGroupsStore().find((entry) => entry.code === code);

export const mockDeleteTaskScoreGroup = async (id: string): Promise<void> => {
  await mockDelay();

  const groups = getMockTaskScoreGroupsStore();
  const group = groups.find((entry) => entry.id === id);
  if (!group) {
    throw new Error('Group not found');
  }

  if (groups.length <= 1) {
    throw new Error('At least one group must remain');
  }

  const taskCount = getMockTaskScoresStore().filter((task) => task.group === group.code).length;
  if (taskCount > 0) {
    throw new Error(`Cannot delete — ${taskCount} task${taskCount === 1 ? '' : 's'} use this group`);
  }

  setMockTaskScoreGroupsStore(groups.filter((entry) => entry.id !== id));
};
