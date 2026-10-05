import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import { canEvaluateTaskLayer } from './taskEvaluation';

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

describe('canEvaluateTaskLayer', () => {
  const parent = task({ id: 'parent', pipelineStage: 'awaiting_cm' });
  const splitParent = task({ id: 'split-parent', pipelineStage: 'split' });
  const child = task({
    id: 'child',
    parentTaskId: 'split-parent',
    taskKind: 'split',
    pipelineStage: 'assigned_staff',
  });
  const wholeStaff = task({ id: 'whole', pipelineStage: 'assigned_staff' });

  it('PM / CH / Head evaluate parents only, not split children', () => {
    for (const role of [ROLES.PM, ROLES.CREATIVE_HEAD, ROLES.HEAD]) {
      expect(canEvaluateTaskLayer(role, parent)).toBe(true);
      expect(canEvaluateTaskLayer(role, child)).toBe(false);
    }
  });

  it('CM evaluates staff execution, not split parents', () => {
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, wholeStaff)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, splitParent)).toBe(false);
    expect(canEvaluateTaskLayer(ROLES.CREATIVE_MANAGER, parent)).toBe(false);
  });

  it('Admin can evaluate any layer; Employee cannot', () => {
    expect(canEvaluateTaskLayer(ROLES.ADMIN, child)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.ADMIN, parent)).toBe(true);
    expect(canEvaluateTaskLayer(ROLES.EMPLOYEE, parent)).toBe(false);
  });
});
