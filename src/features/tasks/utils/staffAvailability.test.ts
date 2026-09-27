import { describe, expect, it } from 'vitest';
import {
  ASSIGN_OVERLOAD_CAPACITY_PERCENT,
  availabilityFromCapacity,
  isCapacityAssignable,
  isStaffAssignable,
  normalizeTaskDepartment,
  staffMatchesDepartment,
} from './staffAvailability';

describe('staffAvailability', () => {
  it('treats free / normal / overloaded as assignable; only leave blocks', () => {
    expect(isStaffAssignable(undefined)).toBe(true);
    expect(isStaffAssignable('free')).toBe(true);
    expect(isStaffAssignable('normal')).toBe(true);
    expect(isStaffAssignable('overloaded')).toBe(true);
    expect(isStaffAssignable('on_leave')).toBe(false);
  });

  it('maps capacity ≥ 80% to overloaded label but still allows assign', () => {
    expect(ASSIGN_OVERLOAD_CAPACITY_PERCENT).toBe(80);
    expect(availabilityFromCapacity(79)).toBe('normal');
    expect(availabilityFromCapacity(80)).toBe('overloaded');
    expect(availabilityFromCapacity(120)).toBe('overloaded');
    expect(isCapacityAssignable(80)).toBe(true);
    expect(isCapacityAssignable(100)).toBe(true);
    expect(isCapacityAssignable(150)).toBe(true);
    expect(isCapacityAssignable(79)).toBe(true);
  });

  it('maps off / on_leave work status to on_leave and blocks assign', () => {
    expect(availabilityFromCapacity(10, 'off')).toBe('on_leave');
    expect(isCapacityAssignable(10, 'off')).toBe(false);
    expect(isCapacityAssignable(120, 'on_leave')).toBe(false);
  });

  it('maps capacity bands for free / normal', () => {
    expect(availabilityFromCapacity(0)).toBe('free');
    expect(availabilityFromCapacity(49)).toBe('free');
    expect(availabilityFromCapacity(50)).toBe('normal');
    expect(availabilityFromCapacity(null)).toBe('normal');
  });

  it('normalizes creative_* user departments to creative', () => {
    expect(normalizeTaskDepartment('project')).toBe('project');
    expect(normalizeTaskDepartment('creative')).toBe('creative');
    expect(normalizeTaskDepartment('creative_hcm')).toBe('creative');
    expect(normalizeTaskDepartment('admin')).toBeUndefined();
  });

  it('matches staff to the assign department', () => {
    expect(staffMatchesDepartment({ code: 'A', name: 'A', department: 'project' }, 'project')).toBe(
      true,
    );
    expect(
      staffMatchesDepartment({ code: 'B', name: 'B', department: 'creative_hcm' }, 'creative'),
    ).toBe(true);
    expect(
      staffMatchesDepartment({ code: 'C', name: 'C', department: 'creative_hcm' }, 'project'),
    ).toBe(false);
  });
});
