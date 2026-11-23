import { describe, expect, it } from 'vitest';
import { ROLES } from '@/config/permissions';
import { TASK_STATUS_BUCKET_FILTER_VALUES } from '../schemas/task.schema';
import {
  bucketToStaffConfirmation,
  computeTaskConfirmationSummary,
  getTaskStatusPickerOptions,
  resolveTaskStatusPickerBucket,
  resolveTaskSummaryBucket,
  TASK_STATUS_PICKER_OPTIONS,
  TASK_SUMMARY_BUCKET_OPTIONS,
  TASK_SUMMARY_BUCKET_ORDER,
} from './taskConfirmationSummary';

describe('picker vs summary options', () => {
  it('summary splits Đã từ chối / Hủy; picker uses Hủy only and omits Cần đánh giá', () => {
    expect(TASK_SUMMARY_BUCKET_OPTIONS.map((o) => o.label)).toEqual([
      'Đang làm',
      'Cần đánh giá',
      'Đã từ chối',
      'Hủy',
      'Hoàn thành',
    ]);
    expect(TASK_STATUS_PICKER_OPTIONS.map((o) => o.label)).toEqual([
      'Đang làm',
      'Hủy',
      'Hoàn thành',
    ]);
  });

  it('list filter enum stays in sync with summary bucket order', () => {
    expect([...TASK_STATUS_BUCKET_FILTER_VALUES]).toEqual([...TASK_SUMMARY_BUCKET_ORDER]);
  });

  it('hides Hủy for Staff unless task already cancelled', () => {
    expect(
      getTaskStatusPickerOptions(ROLES.EMPLOYEE, { staffConfirmation: 'confirmed' }).map(
        (o) => o.value,
      ),
    ).toEqual(['inProgress', 'completed']);
    expect(
      getTaskStatusPickerOptions(ROLES.EMPLOYEE, { staffConfirmation: 'cancelled' }).map(
        (o) => o.value,
      ),
    ).toContain('cancelled');
    expect(
      getTaskStatusPickerOptions(ROLES.PM, { staffConfirmation: 'confirmed' }).map((o) => o.value),
    ).toContain('cancelled');
  });
});

describe('resolveTaskSummaryBucket', () => {
  it('folds not_updated + confirmed into Đang làm', () => {
    expect(resolveTaskSummaryBucket({ staffConfirmation: 'not_updated' })).toBe('inProgress');
    expect(resolveTaskSummaryBucket({ staffConfirmation: 'confirmed' })).toBe('inProgress');
  });

  it('splits finished by evaluation into Cần đánh giá vs Hoàn thành', () => {
    expect(
      resolveTaskSummaryBucket({
        staffConfirmation: 'finished',
        completionPercent: null,
        pmEvaluation: '',
      }),
    ).toBe('needsEvaluation');
    expect(
      resolveTaskSummaryBucket({
        staffConfirmation: 'finished',
        completionPercent: 90,
        pmEvaluation: '',
      }),
    ).toBe('completed');
    expect(
      resolveTaskSummaryBucket({
        staffConfirmation: 'finished',
        completionPercent: null,
        pmEvaluation: 'ok',
      }),
    ).toBe('completed');
  });

  it('keeps decline and cancelled as separate buckets', () => {
    expect(resolveTaskSummaryBucket({ staffConfirmation: 'decline' })).toBe('declined');
    expect(resolveTaskSummaryBucket({ staffConfirmation: 'cancelled' })).toBe('cancelled');
  });
});

describe('resolveTaskStatusPickerBucket', () => {
  it('maps finished→Hoàn thành, cancelled→Hủy, decline→Đang làm (not Hủy)', () => {
    expect(resolveTaskStatusPickerBucket({ staffConfirmation: 'finished' })).toBe('completed');
    expect(
      resolveTaskStatusPickerBucket({
        staffConfirmation: 'finished',
        completionPercent: null,
        pmEvaluation: '',
      }),
    ).toBe('completed');
    expect(resolveTaskStatusPickerBucket({ staffConfirmation: 'cancelled' })).toBe('cancelled');
    expect(resolveTaskStatusPickerBucket({ staffConfirmation: 'decline' })).toBe('inProgress');
    expect(resolveTaskStatusPickerBucket({ staffConfirmation: 'confirmed' })).toBe('inProgress');
  });
});

describe('bucketToStaffConfirmation', () => {
  it('maps Hủy to cancelled; rejects declined (CTA-only)', () => {
    expect(
      bucketToStaffConfirmation('cancelled', ROLES.EMPLOYEE, { staffConfirmation: 'confirmed' }),
    ).toEqual({ ok: true, status: 'cancelled' });
    expect(
      bucketToStaffConfirmation('cancelled', ROLES.PM, { staffConfirmation: 'confirmed' }),
    ).toEqual({ ok: true, status: 'cancelled' });
    expect(
      bucketToStaffConfirmation('declined', ROLES.PM, { staffConfirmation: 'confirmed' }).ok,
    ).toBe(false);
  });

  it('maps Đang làm / Hoàn thành / Cần đánh giá→finished', () => {
    expect(
      bucketToStaffConfirmation('inProgress', ROLES.PM, { staffConfirmation: 'not_updated' }),
    ).toEqual({ ok: true, status: 'confirmed' });
    expect(
      bucketToStaffConfirmation('completed', ROLES.EMPLOYEE, { staffConfirmation: 'confirmed' }),
    ).toEqual({ ok: true, status: 'finished' });
    expect(
      bucketToStaffConfirmation('needsEvaluation', ROLES.PM, { staffConfirmation: 'confirmed' }),
    ).toEqual({ ok: true, status: 'finished' });
  });
});

describe('computeTaskConfirmationSummary + list filter contract', () => {
  const sample = [
    { staffConfirmation: 'not_updated' as const },
    { staffConfirmation: 'confirmed' as const },
    { staffConfirmation: 'decline' as const },
    { staffConfirmation: 'cancelled' as const },
    { staffConfirmation: 'finished' as const, completionPercent: null, pmEvaluation: '' },
    { staffConfirmation: 'finished' as const, completionPercent: 80, pmEvaluation: '' },
  ];

  it('counts all five buckets separately', () => {
    expect(computeTaskConfirmationSummary(sample)).toEqual({
      total: 6,
      inProgress: 2,
      needsEvaluation: 1,
      declined: 1,
      cancelled: 1,
      completed: 1,
    });
  });

  it('statusBucket filter matches resolveTaskSummaryBucket (Project Tasks / CQ contract)', () => {
    const byBucket = (bucket: (typeof TASK_SUMMARY_BUCKET_ORDER)[number]) =>
      sample.filter((task) => resolveTaskSummaryBucket(task) === bucket);

    expect(byBucket('inProgress')).toHaveLength(2);
    expect(byBucket('needsEvaluation')).toHaveLength(1);
    expect(byBucket('declined')).toHaveLength(1);
    expect(byBucket('cancelled')).toHaveLength(1);
    expect(byBucket('completed')).toHaveLength(1);
  });
});
