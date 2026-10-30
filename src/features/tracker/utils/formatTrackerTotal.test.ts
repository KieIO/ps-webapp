import { describe, expect, it } from 'vitest';
import { formatTrackerTotal, getTrackerTotalParts } from './formatTrackerTotal';

describe('formatTrackerTotal', () => {
  it('shows calculated only when plannedSlides is unset', () => {
    expect(formatTrackerTotal({ totalSlides: 83 })).toBe('83');
    expect(formatTrackerTotal({ totalSlides: 83, plannedSlides: null })).toBe('83');
    expect(formatTrackerTotal({ totalSlides: 83, plannedSlides: undefined })).toBe('83');
  });

  it('shows calculated/planned when plannedSlides is set', () => {
    expect(formatTrackerTotal({ totalSlides: 83, plannedSlides: 139 })).toBe('83/139');
    expect(formatTrackerTotal({ totalSlides: 83, plannedSlides: 29 })).toBe('83/29');
  });

  it('formats both sides with the same number formatting', () => {
    const calculated = (1200).toLocaleString();
    const planned = (2500).toLocaleString();
    expect(formatTrackerTotal({ totalSlides: 1200, plannedSlides: 2500 })).toBe(
      `${calculated}/${planned}`,
    );
  });
});

describe('getTrackerTotalParts', () => {
  it('splits calculated and planned for styled UI', () => {
    expect(getTrackerTotalParts({ totalSlides: 475, plannedSlides: 219 })).toEqual({
      calculated: '475',
      planned: '219',
    });
    expect(getTrackerTotalParts({ totalSlides: 83 })).toEqual({
      calculated: '83',
      planned: null,
    });
  });
});
