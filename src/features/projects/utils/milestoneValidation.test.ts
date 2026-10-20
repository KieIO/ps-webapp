import { describe, expect, it } from 'vitest';
import {
  sumMilestoneQuantityByUnit,
  toReplaceMilestonePayload,
  validateMilestones,
} from './milestoneValidation';

const ctx = {
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  totalSlides: 100,
};

const base = {
  name: 'Nộp đợt 1',
  deadlineDate: '2026-09-10',
  quantity: 10,
  unit: 'slides' as const,
  note: '',
  completed: false,
};

describe('validateMilestones', () => {
  it('accepts milestones within range under totalSlides', () => {
    expect(
      validateMilestones([{ ...base }, { ...base, name: 'Đợt 2', quantity: 20 }], ctx),
    ).toEqual({ ok: true });
  });

  it('rejects deadline outside project range', () => {
    const result = validateMilestones([{ ...base, deadlineDate: '2026-10-01' }], ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/thời gian dự án/);
    }
  });

  it('hard-blocks when slides sum exceeds totalSlides', () => {
    const result = validateMilestones(
      [
        { ...base, quantity: 60 },
        { ...base, name: 'Đợt 2', quantity: 50 },
      ],
      ctx,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/vượt totalSlides/);
    }
  });

  it('ignores DA quantity when comparing to totalSlides', () => {
    expect(
      validateMilestones(
        [
          { ...base, quantity: 100 },
          { ...base, name: 'DA', quantity: 50, unit: 'da' },
        ],
        ctx,
      ),
    ).toEqual({ ok: true });
  });

  it('skips slides-sum check when totalSlides is 0', () => {
    expect(validateMilestones([{ ...base, quantity: 50 }], { ...ctx, totalSlides: 0 })).toEqual({
      ok: true,
    });
  });

  it('rejects empty name', () => {
    const result = validateMilestones([{ ...base, name: '  ' }], ctx);
    expect(result.ok).toBe(false);
  });

  it('allows empty volume when unit is empty and quantity is null', () => {
    expect(
      validateMilestones(
        [
          {
            name: 'Kickoff',
            deadlineDate: '2026-09-10',
            quantity: null,
            unit: '',
            note: 'Họp nội bộ',
            completed: false,
          },
        ],
        ctx,
      ),
    ).toEqual({ ok: true });
  });

  it('rejects slides unit without quantity', () => {
    const result = validateMilestones(
      [
        {
          name: 'Bad',
          deadlineDate: '2026-09-10',
          quantity: null,
          unit: 'slides',
          note: '',
          completed: false,
        },
      ],
      ctx,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/khối lượng phải lớn hơn 0/i);
    }
  });

  it('rejects non-integer quantity', () => {
    const result = validateMilestones([{ ...base, quantity: 3.1, unit: 'da' }], ctx);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/số nguyên/i);
    }
  });
});

describe('sumMilestoneQuantityByUnit', () => {
  it('sums only matching unit and ignores empty-volume rows', () => {
    expect(
      sumMilestoneQuantityByUnit(
        [
          { quantity: 10, unit: 'slides' },
          { quantity: 5, unit: 'da' },
          { quantity: 7, unit: 'slides' },
          { quantity: null, unit: '' },
        ],
        'slides',
      ),
    ).toBe(17);
  });
});

describe('toReplaceMilestonePayload', () => {
  it('keeps ids and normalizes empty volume to quantity null + unit ""', () => {
    expect(
      toReplaceMilestonePayload([
        {
          id: 'keep-me',
          name: 'A',
          deadlineDate: '2026-09-10T12:00:00.000Z',
          quantity: 10,
          unit: 'slides',
          note: ' x ',
          completed: true,
        },
        {
          id: 'empty',
          name: 'B',
          deadlineDate: '2026-09-11',
          quantity: null,
          unit: '',
          note: '',
          completed: false,
        },
      ]),
    ).toEqual([
      {
        id: 'keep-me',
        name: 'A',
        deadlineDate: '2026-09-10',
        quantity: 10,
        unit: 'slides',
        note: 'x',
        completed: true,
      },
      {
        id: 'empty',
        name: 'B',
        deadlineDate: '2026-09-11',
        quantity: null,
        unit: '',
        note: '',
        completed: false,
      },
    ]);
  });
});
