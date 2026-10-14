import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  isDayBookedByOpenLeaves,
  isOpenLeave,
  leaveStatusLabel,
  rangeOverlapsOpenLeaves,
  resolveLeaveStatusOnCreate,
} from './leaveStatus';

describe('resolveLeaveStatusOnCreate', () => {
  const today = dayjs('2026-10-14');

  it('marks fully past leave as ended', () => {
    expect(resolveLeaveStatusOnCreate('2026-10-01', '2026-10-05', today)).toBe('ended');
  });

  it('marks future leave as scheduled (not on leave yet)', () => {
    expect(resolveLeaveStatusOnCreate('2026-10-20', '2026-10-25', today)).toBe('scheduled');
  });

  it('marks leave covering today as active', () => {
    expect(resolveLeaveStatusOnCreate('2026-10-10', '2026-10-18', today)).toBe('active');
    expect(resolveLeaveStatusOnCreate('2026-10-14', '2026-10-16', today)).toBe('active');
  });

  it('supports multiple non-overlapping future periods', () => {
    expect(resolveLeaveStatusOnCreate('2026-11-01', '2026-11-05', today)).toBe('scheduled');
    expect(resolveLeaveStatusOnCreate('2026-11-20', '2026-11-25', today)).toBe('scheduled');
  });
});

describe('isOpenLeave', () => {
  it('treats scheduled and active as open', () => {
    expect(isOpenLeave({ status: 'scheduled' })).toBe(true);
    expect(isOpenLeave({ status: 'active' })).toBe(true);
    expect(isOpenLeave({ status: 'ended' })).toBe(false);
    expect(isOpenLeave({ status: 'cancelled' })).toBe(false);
  });
});

describe('leaveStatusLabel', () => {
  it('returns display labels', () => {
    expect(leaveStatusLabel('scheduled')).toBe('Scheduled');
    expect(leaveStatusLabel('active')).toBe('On leave');
  });
});

describe('open leave booking helpers', () => {
  const leaves = [
    { startDate: '2026-11-01', endDate: '2026-11-05' },
    { startDate: '2026-11-20', endDate: '2026-11-25' },
  ];

  it('flags days inside booked periods', () => {
    expect(isDayBookedByOpenLeaves(dayjs('2026-11-03'), leaves)).toBe(true);
    expect(isDayBookedByOpenLeaves(dayjs('2026-11-06'), leaves)).toBe(false);
    expect(isDayBookedByOpenLeaves(dayjs('2026-11-20'), leaves)).toBe(true);
  });

  it('detects overlapping ranges for form validation', () => {
    expect(rangeOverlapsOpenLeaves(dayjs('2026-11-04'), dayjs('2026-11-08'), leaves)).toBe(true);
    expect(rangeOverlapsOpenLeaves(dayjs('2026-11-06'), dayjs('2026-11-10'), leaves)).toBe(false);
    expect(rangeOverlapsOpenLeaves(dayjs('2026-11-10'), dayjs('2026-11-19'), leaves)).toBe(false);
  });
});
