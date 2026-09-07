import { describe, expect, it } from 'vitest';
import type { MyTask } from '../schemas/task.schema';
import {
  isTaskActiveOnWorkDate,
  parseWorkDateParam,
  shouldDefaultWorkDate,
  WORK_DATE_ALL,
  WORK_DATE_PARAM,
} from './taskWorkDate';

const task = (overrides: Partial<MyTask>): MyTask =>
  ({
    id: 't1',
    taskCategory: 'project',
    taskCode: 'CODE',
    projectName: 'P',
    projectManager: { code: 'PM', name: 'PM' },
    taskName: 'Slides',
    level: 2,
    quantity: 1,
    date: '2026-09-04T00:00:00.000Z',
    deadline: '2026-09-06T21:19:00.000Z',
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

describe('parseWorkDateParam', () => {
  it('reads a calendar day and treats all as unset', () => {
    expect(parseWorkDateParam('2026-09-06')).toBe('2026-09-06');
    expect(parseWorkDateParam(WORK_DATE_ALL)).toBeUndefined();
    expect(parseWorkDateParam('2026-09')).toBeUndefined();
  });
});

describe('shouldDefaultWorkDate', () => {
  it('defaults only on a clean project-tasks URL when enabled', () => {
    expect(shouldDefaultWorkDate(new URLSearchParams(), true)).toBe(true);
    expect(shouldDefaultWorkDate(new URLSearchParams(), false)).toBe(false);
    expect(
      shouldDefaultWorkDate(new URLSearchParams(`${WORK_DATE_PARAM}=${WORK_DATE_ALL}`), true),
    ).toBe(false);
    expect(shouldDefaultWorkDate(new URLSearchParams('projectName=GoWare'), true)).toBe(false);
    expect(shouldDefaultWorkDate(new URLSearchParams('completedMonth=2026-09'), true)).toBe(false);
  });
});

describe('isTaskActiveOnWorkDate', () => {
  it('includes the selected day inside date → deadline', () => {
    const spanning = task({});
    expect(isTaskActiveOnWorkDate(spanning, '2026-09-04')).toBe(true);
    expect(isTaskActiveOnWorkDate(spanning, '2026-09-06')).toBe(true);
    expect(isTaskActiveOnWorkDate(spanning, '2026-09-03')).toBe(false);
    expect(isTaskActiveOnWorkDate(spanning, '2026-09-07')).toBe(false);
  });

  it('treats a missing deadline as the task calendar day', () => {
    const singleDay = task({ deadline: null, date: '2026-09-06T00:00:00.000Z' });
    expect(isTaskActiveOnWorkDate(singleDay, '2026-09-06')).toBe(true);
    expect(isTaskActiveOnWorkDate(singleDay, '2026-09-05')).toBe(false);
  });
});
