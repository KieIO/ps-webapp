import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateTaskUrgency, resolveTaskUrgencyDisplay } from './taskUrgency';

describe('calculateTaskUrgency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns gray for finished tasks', () => {
    expect(
      calculateTaskUrgency({
        staffConfirmation: 'finished',
        date: '2026-07-10T00:00:00.000Z',
      }),
    ).toBe('gray');
  });

  it('returns red when deadline is within 3 days', () => {
    expect(
      calculateTaskUrgency({
        staffConfirmation: 'not_updated',
        date: '2026-07-15T00:00:00.000Z',
      }),
    ).toBe('red');
  });

  it('returns orange when deadline is within 7 days', () => {
    expect(
      calculateTaskUrgency({
        staffConfirmation: 'confirmed',
        date: '2026-07-18T00:00:00.000Z',
      }),
    ).toBe('orange');
  });

  it('returns green when deadline is beyond 7 days', () => {
    expect(
      calculateTaskUrgency({
        staffConfirmation: 'not_updated',
        date: '2026-07-25T00:00:00.000Z',
      }),
    ).toBe('green');
  });
});

describe('resolveTaskUrgencyDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps locked colors', () => {
    expect(
      resolveTaskUrgencyDisplay({
        urgency: 'green',
        staffConfirmation: 'not_updated',
        date: '2026-07-15T00:00:00.000Z',
      }),
    ).toBe('green');
  });

  it('calculates when auto', () => {
    expect(
      resolveTaskUrgencyDisplay({
        urgency: 'auto',
        staffConfirmation: 'not_updated',
        date: '2026-07-15T00:00:00.000Z',
      }),
    ).toBe('red');
  });
});
