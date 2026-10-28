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
    expect(visibility.assignShapeOptions).not.toContain('split_child');
  });

  it('hides split/eval filters on CM intake', () => {
    const visibility = resolveCreativeQueueFilterVisibility('cm', 'intake', {});
    expect(visibility.showAssignShape).toBe(false);
    expect(visibility.showEvaluation).toBe(false);
    expect(visibility.showConfirmation).toBe(false);
  });

  it('shows staff evaluation and confirmation on CM execution', () => {
    const visibility = resolveCreativeQueueFilterVisibility('cm', 'execution', {
      assignShape: 'split_child',
    });
    expect(visibility.showAssignShape).toBe(true);
    expect(visibility.showSplitDate).toBe(true);
    expect(visibility.showEvaluation).toBe(true);
    expect(visibility.showConfirmation).toBe(true);
    expect(visibility.evaluationLayer).toBe('staff');
  });
});

describe('applyCreativeQueueFilters', () => {
  const visibility = resolveCreativeQueueFilterVisibility('cm', 'execution', {
    assignShape: 'all',
  });

  it('filters by assign shape, evaluation, confirmation, and split date', () => {
    const whole = base({
      id: 'whole',
      pipelineStage: 'assigned_staff',
      completionPercent: 80,
      staffConfirmation: 'finished',
    });
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

    expect(
      applyCreativeQueueFilters(
        [whole, splitParent, child],
        { assignShape: 'whole' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['whole']);

    expect(
      applyCreativeQueueFilters(
        [whole, splitParent, child],
        { assignShape: 'split_child', evaluation: 'not_evaluated' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['child']);

    expect(
      applyCreativeQueueFilters(
        [whole, splitParent, child],
        { assignShape: 'split_child', splitFrom: '2026-10-11', splitTo: '2026-10-13' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['child']);

    expect(
      applyCreativeQueueFilters(
        [whole, splitParent, child],
        { confirmation: 'confirmed' },
        visibility,
      ).map((task) => task.id),
    ).toEqual(['child']);
  });

  it('uses handoff evaluation on CH visibility', () => {
    const chVisibility = resolveCreativeQueueFilterVisibility('ch', 'intake', {});
    const scored = base({
      id: 'scored',
      pipelineStage: 'assigned_staff',
      handoffCompletionPercent: 90,
      completionPercent: null,
    });
    const pending = base({
      id: 'pending',
      pipelineStage: 'assigned_staff',
      handoffCompletionPercent: null,
      handoffEvaluation: '',
    });
    expect(
      applyCreativeQueueFilters([scored, pending], { evaluation: 'evaluated' }, chVisibility).map(
        (task) => task.id,
      ),
    ).toEqual(['scored']);
  });
});

describe('sanitizeCreativeQueueFilters', () => {
  it('clears execution-only filters when moving to CM intake', () => {
    const sanitized = sanitizeCreativeQueueFilters(
      {
        search: 'x',
        assignShape: 'split_child',
        evaluation: 'not_evaluated',
        confirmation: 'finished',
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
});
