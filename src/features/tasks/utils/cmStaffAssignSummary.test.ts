import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  computeCmStaffAssignSummary,
  formatCmStaffCompletedQuantityLabel,
  resolveCmStaffAssignBucket,
} from './cmStaffAssignSummary';

const base = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCode: 'T-1',
    taskName: 'Slides',
    taskCategory: 'project',
    department: 'creative',
    projectName: 'P',
    projectManager: { code: 'PM', name: 'PM' },
    staff: [],
    quantity: 10,
    level: 2,
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    staffConfirmation: 'not_updated',
    date: '2026-11-01',
    deadline: null,
    creativeDeadline: null,
    description: '',
    note: '',
    urgency: 'normal',
    ...overrides,
  }) as MyTask;

describe('resolveCmStaffAssignBucket', () => {
  it('marks awaiting_cm as Cần giao', () => {
    expect(
      resolveCmStaffAssignBucket(
        base({ pipelineStage: 'awaiting_cm', creativeManager: { code: 'CM', name: 'CM' } }),
      ),
    ).toBe('needsAssign');
  });

  it('marks assigned_staff in progress as Đã giao', () => {
    expect(
      resolveCmStaffAssignBucket(
        base({
          pipelineStage: 'assigned_staff',
          staffConfirmation: 'confirmed',
          staff: [{ code: 'E1', name: 'Staff', userId: 'u1' }],
        }),
      ),
    ).toBe('assigned');
  });

  it('marks finished+evaluated as Hoàn thành', () => {
    expect(
      resolveCmStaffAssignBucket(
        base({
          pipelineStage: 'assigned_staff',
          staffConfirmation: 'finished',
          completionPercent: 100,
          pmEvaluation: '5',
          staff: [{ code: 'E1', name: 'Staff', userId: 'u1' }],
        }),
      ),
    ).toBe('completed');
  });
});

describe('formatCmStaffCompletedQuantityLabel', () => {
  it('shows child finished ratio for split parents', () => {
    const parent = base({
      id: 'p',
      taskCode: 'P-1',
      pipelineStage: 'split',
      taskKind: 'original',
    });
    const children = [
      base({
        id: 'c1',
        parentTaskId: 'p',
        taskCode: 'P-1-S1',
        taskKind: 'split',
        staffConfirmation: 'finished',
      }),
      base({
        id: 'c2',
        parentTaskId: 'p',
        taskCode: 'P-1-S2',
        taskKind: 'split',
        staffConfirmation: 'confirmed',
      }),
    ];
    expect(formatCmStaffCompletedQuantityLabel(parent, [parent, ...children])).toBe('1/2');
  });

  it('shows 0/qty until finished for whole tasks', () => {
    expect(
      formatCmStaffCompletedQuantityLabel(
        base({ pipelineStage: 'assigned_staff', quantity: 40, staffConfirmation: 'confirmed' }),
        [],
      ),
    ).toBe('0/40');
  });
});

describe('computeCmStaffAssignSummary', () => {
  it('counts buckets and total', () => {
    const rows = [
      base({ id: 'a', pipelineStage: 'awaiting_cm' }),
      base({
        id: 'b',
        pipelineStage: 'assigned_staff',
        staffConfirmation: 'confirmed',
        staff: [{ code: 'E1', name: 'S', userId: 'u' }],
      }),
      base({
        id: 'c',
        pipelineStage: 'assigned_staff',
        staffConfirmation: 'finished',
        completionPercent: 100,
        pmEvaluation: '5',
        staff: [{ code: 'E1', name: 'S', userId: 'u' }],
      }),
    ];
    expect(computeCmStaffAssignSummary(rows)).toEqual({
      total: 3,
      needsAssign: 1,
      assigned: 1,
      completed: 1,
    });
  });
});
