import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import dayjs from 'dayjs';
import type { TaskAssignee } from '../schemas/task.schema';
import {
  buildCapacityByUserId,
  canSelectAssigneeWithCapacity,
  displayCapacityPercentFromSnapshot,
  formatAssignCapacityPeriodNote,
  resolveAssignCapacityDate,
} from './assignCapacity';

describe('assignCapacity', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-24T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prefers creativeDeadline over deadline over today', () => {
    const withCreative = resolveAssignCapacityDate({
      creativeDeadline: '2026-09-01T17:00:00.000Z',
      deadline: '2026-08-28T17:00:00.000Z',
    });
    expect(withCreative.source).toBe('creative_deadline');
    expect(withCreative.date).toBe(dayjs('2026-09-01T17:00:00.000Z').format('YYYY-MM-DD'));

    const withDeadline = resolveAssignCapacityDate({
      creativeDeadline: null,
      deadline: '2026-08-28T17:00:00.000Z',
    });
    expect(withDeadline.source).toBe('deadline');
    expect(withDeadline.date).toBe(dayjs('2026-08-28T17:00:00.000Z').format('YYYY-MM-DD'));

    expect(resolveAssignCapacityDate({ creativeDeadline: null, deadline: null })).toEqual({
      date: dayjs().format('YYYY-MM-DD'),
      source: 'today',
    });
  });

  it('formats period notes for UX', () => {
    expect(
      formatAssignCapacityPeriodNote({ date: '2026-09-01', source: 'creative_deadline' }),
    ).toContain('creative deadline');
    expect(formatAssignCapacityPeriodNote({ date: '2026-08-28', source: 'deadline' })).toContain(
      'deadline',
    );
    expect(formatAssignCapacityPeriodNote({ date: '2026-08-24', source: 'today' })).toContain(
      'hôm nay',
    );
  });

  it('locks overloaded and on-leave from capacity snapshot', () => {
    const staff = { code: 'S1', name: 'Staff', userId: 'u1' } as TaskAssignee;
    const map = buildCapacityByUserId([
      {
        id: 'u1',
        name: 'Staff',
        department: 'creative_hcm',
        jobLevel: 'junior',
        positionCode: 'JR',
        jobTitleName: 'Junior',
        workStatus: 'working',
        dailyCapacityPoints: 100,
        specialistTaskPoints: 0,
        achievedTaskPoints: 90,
        capacityPercent: 90,
      },
    ]);
    expect(canSelectAssigneeWithCapacity(staff, map)).toBe(false);
    expect(displayCapacityPercentFromSnapshot(staff, map)).toBe(90);

    const leaveMap = buildCapacityByUserId([
      {
        id: 'u1',
        name: 'Staff',
        department: 'creative_hcm',
        jobLevel: 'junior',
        positionCode: 'JR',
        jobTitleName: 'Junior',
        workStatus: 'off',
        dailyCapacityPoints: 100,
        specialistTaskPoints: 0,
        achievedTaskPoints: 0,
        capacityPercent: 10,
      },
    ]);
    expect(canSelectAssigneeWithCapacity(staff, leaveMap)).toBe(false);
  });

  it('allows selection at 79%', () => {
    const staff = { code: 'S1', name: 'Staff', userId: 'u1' } as TaskAssignee;
    const map = buildCapacityByUserId([
      {
        id: 'u1',
        name: 'Staff',
        department: 'creative_hcm',
        jobLevel: 'junior',
        positionCode: 'JR',
        jobTitleName: 'Junior',
        workStatus: 'working',
        dailyCapacityPoints: 100,
        specialistTaskPoints: 0,
        achievedTaskPoints: 79,
        capacityPercent: 79,
      },
    ]);
    expect(canSelectAssigneeWithCapacity(staff, map)).toBe(true);
  });
});
