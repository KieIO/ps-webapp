import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import { INITIAL_MOCK_TASKS } from './tasks.data';
import { filterMockTasks } from './tasks.mock';

const baseTask = INITIAL_MOCK_TASKS[0];

const task = (overrides: Partial<MyTask>): MyTask => ({
  ...baseTask,
  id: overrides.id ?? 'test-task',
  ...overrides,
});

describe('filterMockTasks dashboard drill-down filters', () => {
  it('filters completed tasks by month and timeliness', () => {
    const onTime = task({
      id: 'on-time',
      staffConfirmation: 'finished',
      completedAt: '2026-07-10T18:00:00.000Z',
      deadline: '2026-07-10T23:59:59.000Z',
    });
    const late = task({
      id: 'late',
      staffConfirmation: 'finished',
      completedAt: '2026-07-11T01:00:00.000Z',
      deadline: '2026-07-10T23:59:59.000Z',
    });
    const unfinished = task({
      id: 'unfinished',
      staffConfirmation: 'confirmed',
      completedAt: null,
    });

    expect(
      filterMockTasks([onTime, late, unfinished], {
        timeliness: 'completed',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['on-time', 'late']);
    expect(
      filterMockTasks([onTime, late], {
        timeliness: 'on_time',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['on-time']);
    expect(
      filterMockTasks([onTime, late], {
        timeliness: 'not_on_time',
        completedMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['late']);
  });

  it('filters project and creative output by task month', () => {
    const projectOutput = task({
      id: 'project-output',
      projectName: 'Sanofi Meninga',
      date: '2026-07-05T00:00:00.000Z',
    });
    const creativeOutput = task({
      id: 'creative-output',
      projectId: null,
      projectName: 'Internal creative',
      taskName: 'Edit   DA 2',
      department: 'creative',
      date: '2026-07-06T00:00:00.000Z',
    });
    const otherMonth = task({
      id: 'other-month',
      projectName: 'Sanofi Meninga',
      date: '2026-08-05T00:00:00.000Z',
    });

    expect(
      filterMockTasks([projectOutput, creativeOutput, otherMonth], {
        outputMetric: 'project_slides',
        outputMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['project-output']);
    expect(
      filterMockTasks([projectOutput, creativeOutput], {
        outputMetric: 'creative_da',
        outputMonth: '2026-07',
      }).map((item) => item.id),
    ).toEqual(['creative-output']);
  });
});
