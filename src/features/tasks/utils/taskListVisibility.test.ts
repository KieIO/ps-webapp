import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  countCmProjectTaskScopes,
  filterTasksForCmProjectScope,
  filterTasksForViewerRole,
  matchesCmProjectTaskScope,
  parseCmProjectTaskScope,
  shouldHideSplitChildFromTaskList,
} from './taskListVisibility';

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

describe('CM Project Tasks scope (option C)', () => {
  it('parses cmScope with received as default', () => {
    expect(parseCmProjectTaskScope(null)).toBe('received');
    expect(parseCmProjectTaskScope('received')).toBe('received');
    expect(parseCmProjectTaskScope('staff')).toBe('staff');
    expect(parseCmProjectTaskScope('other')).toBe('received');
  });

  it('puts awaiting_cm and split parents on Task nhận; children and whole-assign on Task giao Staff', () => {
    const awaiting = task({ id: 'awaiting', pipelineStage: 'awaiting_cm', staff: [] });
    const splitParent = task({ id: 'split-parent', pipelineStage: 'split', staff: [] });
    const whole = task({
      id: 'whole',
      pipelineStage: 'assigned_staff',
      staff: [{ userId: 's1', code: 'S1', name: 'Staff', role: ROLES.EMPLOYEE }],
    });
    const child = task({
      id: 'child',
      parentTaskId: 'split-parent',
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
      staff: [{ userId: 's2', code: 'S2', name: 'Staff 2', role: ROLES.EMPLOYEE }],
    });

    expect(matchesCmProjectTaskScope(awaiting, 'received')).toBe(true);
    expect(matchesCmProjectTaskScope(awaiting, 'staff')).toBe(false);
    expect(matchesCmProjectTaskScope(splitParent, 'received')).toBe(true);
    expect(matchesCmProjectTaskScope(splitParent, 'staff')).toBe(false);
    expect(matchesCmProjectTaskScope(whole, 'received')).toBe(false);
    expect(matchesCmProjectTaskScope(whole, 'staff')).toBe(true);
    expect(matchesCmProjectTaskScope(child, 'received')).toBe(false);
    expect(matchesCmProjectTaskScope(child, 'staff')).toBe(true);

    const items = [awaiting, splitParent, whole, child];
    expect(filterTasksForCmProjectScope(items, 'received').map((item) => item.id)).toEqual([
      'awaiting',
      'split-parent',
    ]);
    expect(filterTasksForCmProjectScope(items, 'staff').map((item) => item.id)).toEqual([
      'whole',
      'child',
    ]);
    expect(countCmProjectTaskScopes(items)).toEqual({ received: 2, staff: 2 });
  });

  it('keeps non-creative tasks on Task nhận only', () => {
    const projectStaff = task({ id: 'proj', department: 'project', pipelineStage: undefined });
    expect(matchesCmProjectTaskScope(projectStaff, 'received')).toBe(true);
    expect(matchesCmProjectTaskScope(projectStaff, 'staff')).toBe(false);
  });
});
