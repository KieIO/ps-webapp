import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  applyCreativeQueueFilters,
  resolveCreativeQueueFilterVisibility,
  sanitizeCreativeQueueFilters,
} from './creativeQueueFilters';

const base = (overrides: Partial<MyTask> = {}): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'PO.1',
    projectName: 'Alpha',
    projectManager: { code: 'PM', name: 'PM' },
    taskName: 'Slides',
    level: 2,
    quantity: 10,
    date: '2026-10-01T00:00:00.000Z',
    description: 'brief',
    staff: [],
    department: 'creative',
    pipelineStage: 'assigned_staff',
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'medium',
    ...overrides,
  }) as MyTask;

describe('resolveCreativeQueueFilterVisibility', () => {
  it('shows handoff evaluation and split shape on CH board', () => {
    const visibility = resolveCreativeQueueFilterVisibility('ch', 'intake', {
      assignShape: 'split',
    });
    expect(visibility.showAssignShape).toBe(true);
    expect(visibility.showSplitDate).toBe(true);
    expect(visibility.showEvaluation).toBe(true);
    expect(visibility.showConfirmation).toBe(false);
    expect(visibility.evaluationLayer).toBe('handoff');
    expect(visibility.assignShapeOptions).toEqual(['all', 'pending_staff', 'split']);
    expect(visibility.assignShapeOptions).not.toContain('split_child');
  });

  it('hides split/eval filters on CM intake', () => {
    const visibility = resolveCreativeQueueFilterVisibility('cm', 'intake', {});
    expect(visibility.showAssignShape).toBe(false);
    expect(visibility.showEvaluation).toBe(false);
    expect(visibility.showConfirmation).toBe(false);
  });

  it('shows staff evaluation and confirmation on CM execution (parents only)', () => {
    const visibility = resolveCreativeQueueFilterVisibility('cm', 'execution', {
      assignShape: 'split',
    });
    expect(visibility.showAssignShape).toBe(true);
    expect(visibility.showSplitDate).toBe(true);
    expect(visibility.showEvaluation).toBe(true);
    expect(visibility.showConfirmation).toBe(true);
    expect(visibility.evaluationLayer).toBe('staff');
    expect(visibility.assignShapeOptions).toEqual(['all', 'split']);
  });
});

describe('applyCreativeQueueFilters', () => {
  const visibility = resolveCreativeQueueFilterVisibility('cm', 'execution', {
    assignShape: 'all',
  });

  it('filters by assign shape, evaluation, status bucket, and split date', () => {
    const splitParent = base({
      id: 'parent',
      pipelineStage: 'split',
      splitAt: '2026-10-10T08:00:00.000Z',
      staffConfirmation: 'not_updated',
    });
    const child = base({
      id: 'child',
      taskCode: 'PO.1-S1',
      parentTaskId: 'parent',
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
      splitAt: '2026-10-12T08:00:00.000Z',
      staffConfirmation: 'confirmed',
      completionPercent: null,
      pmEvaluation: '',
    });
    const finishedChild = base({
      id: 'finished-child',
      taskCode: 'PO.1-S2',
      parentTaskId: 'parent',
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
      staffConfirmation: 'finished',
      completionPercent: 80,
    });

    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        { assignShape: 'split' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['parent']);

    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        { assignShape: 'split_child', evaluation: 'not_evaluated' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['child']);

    const dateVisibility = resolveCreativeQueueFilterVisibility('cm', 'execution', {
      assignShape: 'split',
    });
    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        {
          assignShape: 'split_child',
          splitFrom: '2026-10-11',
          splitTo: '2026-10-13',
        },
        dateVisibility,
      ).map((task) => task.id),
    ).toEqual(['child']);

    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        { statusBucket: 'unconfirmed' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['parent']);

    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        { statusBucket: 'inProgress' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['child']);

    expect(
      applyCreativeQueueFilters(
        [splitParent, child, finishedChild],
        { statusBucket: 'completed' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['finished-child']);

    const awaitingEval = base({
      id: 'awaiting-eval',
      parentTaskId: 'parent',
      taskKind: 'split',
      pipelineStage: 'assigned_staff',
      staffConfirmation: 'finished',
      completionPercent: null,
      pmEvaluation: '',
    });
    expect(
      applyCreativeQueueFilters(
        [awaitingEval],
        { statusBucket: 'needsEvaluation' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['awaiting-eval']);
  });
});

describe('sanitizeCreativeQueueFilters', () => {
  it('clears execution-only filters on CM intake', () => {
    const sanitized = sanitizeCreativeQueueFilters(
      {
        search: 'x',
        projectName: undefined,
        assignShape: 'split',
        evaluation: 'evaluated',
        statusBucket: 'completed',
        splitFrom: '2026-10-01',
      },
      resolveCreativeQueueFilterVisibility('cm', 'intake', {}),
    );
    expect(sanitized).toEqual({
      search: 'x',
      projectName: undefined,
      assignShape: 'all',
      evaluation: 'all',
    });
  });

  it('keeps statusBucket on CM execution; drops unknown assignShape', () => {
    const sanitized = sanitizeCreativeQueueFilters(
      { statusBucket: 'declined', assignShape: 'whole' as 'split' },
      resolveCreativeQueueFilterVisibility('cm', 'execution', { assignShape: 'split' }),
    );
    expect(sanitized.statusBucket).toBe('declined');
    expect(sanitized.assignShape).toBe('all');
  });
});
