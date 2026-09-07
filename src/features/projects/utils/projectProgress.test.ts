import { describe, expect, it } from 'vitest';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { computeProjectDetailStats, resolveProjectDetailStats } from './projectProgress';

const task = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'CODE',
    projectName: 'P',
    projectManager: { code: 'PM', name: 'PM' },
    taskName: 'Slides',
    level: 2,
    quantity: 10,
    date: '2026-09-06T00:00:00.000Z',
    description: '',
    staff: [],
    designThinking: 2,
    technical: 2,
    contentProcessing: 2,
    additionalFactors: '',
    pmEvaluation: '',
    pmNote: '',
    staffConfirmation: 'not_updated',
    staffNote: '',
    urgency: 'auto',
    ...overrides,
  }) as MyTask;

describe('computeProjectDetailStats', () => {
  it('counts tasks, sums slides quantity, and averages completion', () => {
    const stats = computeProjectDetailStats([
      task({ id: 's1', taskName: 'Slides', quantity: 20, completionPercent: 50 }),
      task({ id: 's2', taskName: 'Redo Slide', quantity: 10, completionPercent: 100 }),
      task({ id: 'd1', taskName: 'DA', quantity: 8, completionPercent: 0 }),
    ]);

    expect(stats.taskCount).toBe(3);
    expect(stats.totalSlides).toBe(30);
    expect(stats.averageCompletionPercent).toBe(50);
  });

  it('skips missing completion values in the average', () => {
    const stats = computeProjectDetailStats([
      task({ id: 's1', completionPercent: 80 }),
      task({ id: 's2', completionPercent: null }),
    ]);

    expect(stats.averageCompletionPercent).toBe(80);
  });
});

describe('resolveProjectDetailStats', () => {
  it('uses API aggregates until the task table is loaded', () => {
    expect(
      resolveProjectDetailStats(
        { taskCount: 12, totalSlides: 240, completionPercent: 61.4 },
        undefined,
      ),
    ).toEqual({
      taskCount: 12,
      totalSlides: 240,
      averageCompletionPercent: 61,
    });
  });
});
