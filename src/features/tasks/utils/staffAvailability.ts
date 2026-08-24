import type { StaffAvailability, TaskAssignee } from '../schemas/task.schema';

export const STAFF_AVAILABILITY_LABELS: Record<StaffAvailability, string> = {
  free: 'Free',
  normal: 'Bình thường',
  overloaded: 'Overloaded',
  on_leave: 'Nghỉ phép',
};

/**
 * Assign picker: capacity ≥ this % is treated as Overloaded and cannot be selected.
 * Aligns with the Capacity chart 80% utilization target.
 */
export const ASSIGN_OVERLOAD_CAPACITY_PERCENT = 80;

/** Soft band below overload — still selectable. */
export const ASSIGN_NORMAL_CAPACITY_PERCENT = 50;

export const isStaffAssignable = (availability: StaffAvailability | undefined): boolean =>
  availability == null || availability === 'free' || availability === 'normal';

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

export const isCapacityAssignable = (
  capacityPercent: number | null | undefined,
  workStatus?: string | null,
): boolean => isStaffAssignable(availabilityFromCapacity(capacityPercent, workStatus));

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
