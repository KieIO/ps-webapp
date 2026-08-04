import { describe, expect, it } from 'vitest';
import {
  buildFallbackTaskHistory,
  formatTaskCodeShort,
  formatTaskHistoryDateLabel,
  getTaskDeadline,
  getTaskStartDate,
} from './taskDetail';
import type { MyTask } from '../schemas/task.schema';

describe('getTaskStartDate', () => {
  it('normalizes to UTC start of the task calendar day', () => {
    const task = {
      date: '2026-06-13T14:30:00.000Z',
    } as MyTask;

    expect(getTaskStartDate(task)).toBe('2026-06-13T00:00:00.000Z');
  });
});

describe('getTaskDeadline', () => {
  it('uses end of the task date day when deadline is missing', () => {
    const task = {
      date: '2026-06-13T00:00:00.000Z',
      projectEndDate: '2026-06-25T00:00:00.000Z',
    } as MyTask;

    expect(getTaskDeadline(task)).toBe('2026-06-13T23:59:59.000Z');
  });

  it('prefers API deadline when present, including custom times', () => {
    const task = {
      date: '2026-06-13T00:00:00.000Z',
      deadline: '2026-06-13T18:30:00Z',
    } as MyTask;

    expect(getTaskDeadline(task)).toBe('2026-06-13T18:30:00.000Z');
  });
});

describe('formatTaskHistoryDateLabel', () => {
  it('formats event timestamps with time', () => {
    expect(formatTaskHistoryDateLabel('2026-06-10T00:00:00.000Z', 'event')).toMatch(
      /\d{2}\/\d{2} \d{2}:\d{2}/,
    );
  });

  it('formats deadline timestamps with UTC date and time', () => {
    expect(formatTaskHistoryDateLabel('2026-06-14T23:59:59.000Z', 'deadline')).toBe(
      '14/06/2026 23:59:59',
    );
  });
});

describe('buildFallbackTaskHistory', () => {
  it('builds a timeline without fabricated minute offsets', () => {
    const task = {
      id: 'task-1',
      date: '2026-06-10T00:00:00.000Z',
      updatedAt: '2026-06-12T18:39:00.000Z',
      projectManager: { code: 'PO.031', name: 'Nguyen Duong Tri' },
      staff: [{ code: 'PO.010', name: 'Bui Thi Hoa' }],
      staffConfirmation: 'confirmed',
    } as MyTask;

    const events = buildFallbackTaskHistory(task);
    expect(events.map((event) => event.description)).toEqual([
      'Task created — Nguyen Duong Tri',
      'Bui Thi Hoa assigned',
      'Status: Đã xác nhận',
      'Deadline',
    ]);
    expect(events[2]?.occurredAt).toBe('2026-06-12T18:39:00.000Z');
    expect(events[3]?.occurredAt).toBe('2026-06-10T23:59:59.000Z');
  });
});

describe('formatTaskCodeShort', () => {
  it('removes the project code suffix', () => {
    expect(formatTaskCodeShort('PO.031.04.0306 - POKE001.29.04.SAN')).toBe('PO.031.04.0306');
  });

  it('returns the original code when no suffix is present', () => {
    expect(formatTaskCodeShort('INT.01.0106')).toBe('INT.01.0106');
  });
});
