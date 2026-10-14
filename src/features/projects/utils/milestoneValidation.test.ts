import { describe, expect, it } from 'vitest';
import { validateMilestones, sumMilestoneQuantityByUnit } from './milestoneValidation';

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
});

describe('sumMilestoneQuantityByUnit', () => {
  it('sums only matching unit', () => {
    expect(
      sumMilestoneQuantityByUnit(
        [
          { quantity: 10, unit: 'slides' },
          { quantity: 5, unit: 'da' },
          { quantity: 7, unit: 'slides' },
        ],
        'slides',
      ),
    ).toBe(17);
  });
});
