/** Seed data + in-memory store for task score groups (dev mock). */
import type { TaskScoreGroupRecord } from '../schemas/taskScoreGroup.schema';

const SEED_DATE = '2024-01-01T00:00:00.000Z';

export const INITIAL_TASK_SCORE_GROUPS: TaskScoreGroupRecord[] = [
  {
    id: 'task-group-implementation',
    code: 'implementation',
    label: 'Implementation',
    colorKey: 'implementation',
    sortOrder: 0,
    createdAt: SEED_DATE,
  },
  {
    id: 'task-group-quality-control',
    code: 'quality_control',
    label: 'Quality control',
    colorKey: 'quality_control',
    sortOrder: 1,
    createdAt: SEED_DATE,
  },
  {
    id: 'task-group-edit-others',
    code: 'edit_others',
    label: 'Edit & others',
    colorKey: 'edit_others',
    sortOrder: 2,
    createdAt: SEED_DATE,
  },
];

let taskScoreGroupsStore = [...INITIAL_TASK_SCORE_GROUPS];

export const getMockTaskScoreGroupsStore = () => taskScoreGroupsStore;
export const setMockTaskScoreGroupsStore = (next: TaskScoreGroupRecord[]) => {
  taskScoreGroupsStore = next;
};
