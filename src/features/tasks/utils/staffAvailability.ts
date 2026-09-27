import type { StaffAvailability, TaskAssignee } from '../schemas/task.schema';

export const STAFF_AVAILABILITY_LABELS: Record<StaffAvailability, string> = {
  free: 'Free',
  normal: 'Bình thường',
  overloaded: 'Overloaded',
  on_leave: 'Nghỉ phép',
};

/**
 * Capacity ≥ this % is labeled Overloaded (informational).
 * Assign is still allowed — display may exceed 100%.
 */
export const ASSIGN_OVERLOAD_CAPACITY_PERCENT = 80;

/** Soft band below overload — still selectable. */
export const ASSIGN_NORMAL_CAPACITY_PERCENT = 50;

/** Only leave blocks assign; Overloaded remains selectable. */
export const isStaffAssignable = (availability: StaffAvailability | undefined): boolean =>
  availability == null ||
  availability === 'free' ||
  availability === 'normal' ||
  availability === 'overloaded';

/** Map real capacity % (and optional work status) into assign-picker availability. */
export const availabilityFromCapacity = (
  capacityPercent: number | null | undefined,
  workStatus?: string | null,
): StaffAvailability => {
  if (workStatus === 'off' || workStatus === 'on_leave') return 'on_leave';
  if (capacityPercent == null || Number.isNaN(capacityPercent)) return 'normal';
  if (capacityPercent >= ASSIGN_OVERLOAD_CAPACITY_PERCENT) return 'overloaded';
  if (capacityPercent < ASSIGN_NORMAL_CAPACITY_PERCENT) return 'free';
  return 'normal';
};

/** Capacity % never blocks assign; only off / on_leave does. */
export const isCapacityAssignable = (
  capacityPercent: number | null | undefined,
  workStatus?: string | null,
): boolean => {
  void capacityPercent;
  if (workStatus === 'off' || workStatus === 'on_leave') return false;
  return true;
};

export const normalizeTaskDepartment = (
  value: string | undefined,
): 'project' | 'creative' | undefined => {
  if (!value) return undefined;
  if (value === 'project') return 'project';
  if (value === 'creative' || value.startsWith('creative_')) return 'creative';
  return undefined;
};

export const staffMatchesDepartment = (
  staff: TaskAssignee,
  department: 'project' | 'creative',
): boolean => normalizeTaskDepartment(staff.department ?? undefined) === department;
