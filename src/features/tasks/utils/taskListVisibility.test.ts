import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import { filterTasksForViewerRole, shouldHideSplitChildFromTaskList } from './taskListVisibility';

const task = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'T-1',
    projectName: 'CRM',
    projectManager: { code: 'PM', name: 'Long' },
    taskName: 'Banner',
    level: 2,
    quantity: 10,
    date: '2026-05-14T00:00:00.000Z',
    description: 'Brief',
    staff: [],
    department: 'creative',
    ...overrides,
  }) as MyTask;

describe('taskListVisibility', () => {
  it('hides split children from PM / CH / Head / Admin', () => {
    const child = task({ id: 'child', parentTaskId: 'parent', taskKind: 'split' });
    expect(shouldHideSplitChildFromTaskList(child, ROLES.PM)).toBe(true);
    expect(shouldHideSplitChildFromTaskList(child, ROLES.CREATIVE_HEAD)).toBe(true);
    expect(shouldHideSplitChildFromTaskList(child, ROLES.HEAD)).toBe(true);
    expect(shouldHideSplitChildFromTaskList(child, ROLES.ADMIN)).toBe(true);
  });

  it('keeps split children visible for CM and Employee', () => {
    const child = task({ id: 'child', parentTaskId: 'parent', taskKind: 'split' });
    expect(shouldHideSplitChildFromTaskList(child, ROLES.CREATIVE_MANAGER)).toBe(false);
    expect(shouldHideSplitChildFromTaskList(child, ROLES.EMPLOYEE)).toBe(false);
  });

  it('never hides parents or revision children from oversight lists', () => {
    const parent = task({ id: 'parent', pipelineStage: 'split' });
    const revision = task({
      id: 'rev',
      parentTaskId: 'parent',
      taskKind: 'revision',
      revisionRound: 1,
    });
    expect(shouldHideSplitChildFromTaskList(parent, ROLES.PM)).toBe(false);
    expect(shouldHideSplitChildFromTaskList(revision, ROLES.PM)).toBe(false);
  });

  it('filterTasksForViewerRole drops only split children for oversight roles', () => {
    const items = [
      task({ id: 'parent', pipelineStage: 'split' }),
      task({ id: 'child', parentTaskId: 'parent', taskKind: 'split' }),
      task({ id: 'rev', parentTaskId: 'parent', taskKind: 'revision', revisionRound: 1 }),
    ];
    expect(filterTasksForViewerRole(items, ROLES.PM).map((item) => item.id)).toEqual([
      'parent',
      'rev',
    ]);
    expect(filterTasksForViewerRole(items, ROLES.CREATIVE_MANAGER).map((item) => item.id)).toEqual([
      'parent',
      'child',
      'rev',
    ]);
  });
});
