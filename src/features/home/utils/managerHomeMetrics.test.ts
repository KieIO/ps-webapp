import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { MyTask } from '@/features/tasks/schemas/task.schema';
import {
  buildManagerActionTasks,
  buildManagerCompletedTodaySummary,
  MANAGER_ACTION_REMIND_CTA,
  managerActionRemindHint,
} from './managerHomeMetrics';

const baseTask = {
  id: 't1',
  taskCategory: 'project' as const,
  taskCode: 'SCR-001',
  projectName: 'P',
  projectManager: { code: 'PM', name: 'PM' },
  level: 2,
  quantity: 1,
  description: '',
  staff: [{ code: 'S1', name: 'Staff' }],
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  additionalFactors: '',
  pmEvaluation: '',
  pmNote: '',
  staffNote: '',
  urgency: 'auto' as const,
};

describe('buildManagerActionTasks', () => {
  it('flags not_updated as unconfirmed', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'A',
      date: '2026-07-14T00:00:00.000Z',
      deadline: '2026-07-20T23:59:59.000Z',
      staffConfirmation: 'not_updated',
      staff: [{ code: 'S1', name: 'Staff', userId: 'u1' }],
    };
    const items = buildManagerActionTasks([task], dayjs('2026-07-14'));
    expect(items).toHaveLength(1);
    expect(items[0]?.issue).toBe('unconfirmed');
    expect(items[0]?.canRemind).toBe(true);
    expect(items[0]?.assigneeUserIds).toEqual(['u1']);
  });

  it('disables remind when staff has no userId', () => {
    const task: MyTask = {
      ...baseTask,
      taskName: 'A',
      date: '2026-07-14T00:00:00.000Z',
      deadline: '2026-07-20T23:59:59.000Z',
      staffConfirmation: 'not_updated',
    };
    const items = buildManagerActionTasks([task], dayjs('2026-07-14'));
    expect(items[0]?.canRemind).toBe(false);
  });

  it('flags near-deadline tasks as deadline_risk', () => {
    const task: MyTask = {
      ...baseTask,
      id: 't2',
      taskCode: 'SCR-002',
      taskName: 'B',
      date: '2026-07-10T00:00:00.000Z',
      deadline: '2026-07-16T23:59:59.000Z',
      staffConfirmation: 'confirmed',
    };
    const items = buildManagerActionTasks([task], dayjs('2026-07-14'));
    expect(items).toHaveLength(1);
    expect(items[0]?.issue).toBe('deadline_risk');
  });

  it('exposes contextual remind CTA labels', () => {
    expect(MANAGER_ACTION_REMIND_CTA.unconfirmed).toBe('Nhắc cập nhật');
    expect(MANAGER_ACTION_REMIND_CTA.deadline_risk).toBe('Nhắc deadline');
    expect(managerActionRemindHint('unconfirmed', 'Huy')).toContain('cập nhật status');
    expect(managerActionRemindHint('deadline_risk', 'Huy')).toContain('sắp quá deadline');
  });

  it('ignores finished tasks even near deadline', () => {
    const task: MyTask = {
      ...baseTask,
      id: 't3',
      taskCode: 'SCR-003',
      taskName: 'C',
      date: '2026-07-10T00:00:00.000Z',
      deadline: '2026-07-15T23:59:59.000Z',
      staffConfirmation: 'finished',
    };
    expect(buildManagerActionTasks([task], dayjs('2026-07-14'))).toHaveLength(0);
  });
});

describe('buildManagerCompletedTodaySummary', () => {
  it('counts finished today over active-today denominator', () => {
    const active: MyTask = {
      ...baseTask,
      id: 'a1',
      taskCode: 'SCR-010',
      taskName: 'Active',
      date: '2026-07-14T00:00:00.000Z',
      deadline: '2026-07-14T23:59:59.000Z',
      staffConfirmation: 'confirmed',
      updatedAt: '2026-07-14T10:00:00.000Z',
    };
    const finished: MyTask = {
      ...baseTask,
      id: 'a2',
      taskCode: 'SCR-011',
      taskName: 'Done',
      date: '2026-07-14T00:00:00.000Z',
      deadline: '2026-07-14T23:59:59.000Z',
      staffConfirmation: 'finished',
      updatedAt: '2026-07-14T12:00:00.000Z',
    };
    const summary = buildManagerCompletedTodaySummary([active, finished], dayjs('2026-07-14'));
    expect(summary.assignedTodayCount).toBe(2);
    expect(summary.completedCount).toBe(1);
    expect(summary.remainingCount).toBe(1);
    expect(summary.percent).toBe(50);
  });
});
