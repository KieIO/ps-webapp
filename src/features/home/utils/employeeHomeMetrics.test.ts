import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import { buildEmployeeEvaluations, buildEmployeeTodayTasks } from './employeeHomeMetrics';

const baseTask = {
  id: 't1',
  taskCategory: 'project' as const,
  taskCode: 'SCR-001',
  projectName: 'P',
  projectManager: { code: 'PM', name: 'PM' },
  level: 2,
  quantity: 1,
  description: '',
  staff: [{ code: 'S1', name: 'Staff', userId: 'u1' }],
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  additionalFactors: '',
  pmEvaluation: '',
  pmNote: '',
  staffNote: '',
  urgency: 'auto' as const,
};

describe('buildEmployeeTodayTasks', () => {
  it('keeps tasks active today and sorts actionable first', () => {
    const today = dayjs('2026-07-14');
    const tasks: MyTask[] = [
      {
        ...baseTask,
        id: 'finished',
        taskCode: 'SCR-003',
        taskName: 'Done',
        date: '2026-07-14T00:00:00.000Z',
        deadline: '2026-07-14T23:59:59.000Z',
        staffConfirmation: 'finished',
      },
      {
        ...baseTask,
        id: 'open',
        taskCode: 'SCR-001',
        taskName: 'Open',
        date: '2026-07-14T00:00:00.000Z',
        deadline: '2026-07-14T23:59:59.000Z',
        staffConfirmation: 'not_updated',
      },
      {
        ...baseTask,
        id: 'other-day',
        taskCode: 'SCR-009',
        taskName: 'Later',
        date: '2026-07-20T00:00:00.000Z',
        deadline: '2026-07-22T23:59:59.000Z',
        staffConfirmation: 'not_updated',
      },
    ];

    const items = buildEmployeeTodayTasks(tasks, today);
    expect(items.map((task) => task.id)).toEqual(['open', 'finished']);
  });
});

describe('buildEmployeeEvaluations', () => {
  it('only keeps tasks with evaluation or note', () => {
    const tasks: MyTask[] = [
      {
        ...baseTask,
        id: 'a',
        taskName: 'A',
        date: '2026-07-14T00:00:00.000Z',
        staffConfirmation: 'finished',
        pmEvaluation: 'Tốt',
        updatedAt: '2026-07-14T10:00:00.000Z',
      },
      {
        ...baseTask,
        id: 'b',
        taskCode: 'SCR-002',
        taskName: 'B',
        date: '2026-07-14T00:00:00.000Z',
        staffConfirmation: 'confirmed',
        pmNote: 'Chỉnh layout',
        updatedAt: '2026-07-13T10:00:00.000Z',
      },
      {
        ...baseTask,
        id: 'c',
        taskCode: 'SCR-003',
        taskName: 'C',
        date: '2026-07-14T00:00:00.000Z',
        staffConfirmation: 'confirmed',
      },
    ];

    const items = buildEmployeeEvaluations(tasks);
    expect(items.map((task) => task.id)).toEqual(['a', 'b']);
  });
});
