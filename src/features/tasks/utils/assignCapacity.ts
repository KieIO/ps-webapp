import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import type { EmployeeCapacity } from '@/features/capacity/schemas/capacity.schema';
import type { MyTask, StaffAvailability, TaskAssignee } from '../schemas/task.schema';
import {
  availabilityFromCapacity,
  isCapacityAssignable,
  isStaffAssignable,
} from './staffAvailability';
import { calendarDateFromTaskDeadline } from './taskDates';

export type AssignCapacityDateSource = 'creative_deadline' | 'deadline' | 'today';

export interface AssignCapacityDate {
  /** YYYY-MM-DD for GET /capacity?date= */
  date: string;
  source: AssignCapacityDateSource;
}

export interface AssignCapacitySnapshot {
  capacityPercent: number | null;
  workStatus?: string | null;
}

/** Prefer creative deadline → internal deadline → today. */
export const resolveAssignCapacityDate = (
  task: Pick<MyTask, 'creativeDeadline' | 'deadline'> | null | undefined,
): AssignCapacityDate => {
  const creativeDate = task?.creativeDeadline
    ? calendarDateFromTaskDeadline(task.creativeDeadline)
    : null;
  if (creativeDate) {
    return { date: creativeDate, source: 'creative_deadline' };
  }
  const deadlineDate = task?.deadline ? calendarDateFromTaskDeadline(task.deadline) : null;
  if (deadlineDate) {
    return { date: deadlineDate, source: 'deadline' };
  }
  return { date: dayjs().format('YYYY-MM-DD'), source: 'today' };
};

export const formatAssignCapacityPeriodNote = ({ date, source }: AssignCapacityDate): string => {
  const label = dayjs(date).format(DATE_FORMAT);
  if (source === 'creative_deadline') {
    return `Capacity theo creative deadline: ${label}`;
  }
  if (source === 'deadline') {
    return `Capacity theo ngày deadline: ${label}`;
  }
  return `Capacity theo hôm nay: ${label} (task chưa có deadline)`;
};

export const buildCapacityByUserId = (
  items: EmployeeCapacity[] | undefined,
): Map<string, AssignCapacitySnapshot> => {
  const map = new Map<string, AssignCapacitySnapshot>();
  for (const item of items ?? []) {
    map.set(item.id, {
      capacityPercent: item.capacityPercent,
      workStatus: item.workStatus,
    });
  }
  return map;
};

export const getCapacitySnapshot = (
  capacityByUserId: Map<string, AssignCapacitySnapshot> | undefined,
  userId: string | undefined,
): AssignCapacitySnapshot | undefined => {
  if (!capacityByUserId || !userId) return undefined;
  return capacityByUserId.get(userId);
};

export const availabilityFromSnapshot = (
  snapshot: AssignCapacitySnapshot | undefined,
  fallback?: StaffAvailability,
): StaffAvailability | undefined => {
  if (snapshot) {
    return availabilityFromCapacity(snapshot.capacityPercent, snapshot.workStatus);
  }
  return fallback;
};

export const displayCapacityPercentFromSnapshot = (
  staff: TaskAssignee,
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
): number | null => {
  const snapshot = getCapacitySnapshot(capacityByUserId, staff.userId ?? undefined);
  if (snapshot) {
    if (snapshot.capacityPercent == null || Number.isNaN(snapshot.capacityPercent)) return null;
    return Math.round(snapshot.capacityPercent);
  }
  return null;
};

export const canSelectAssigneeWithCapacity = (
  staff: TaskAssignee,
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
): boolean | null => {
  const snapshot = getCapacitySnapshot(capacityByUserId, staff.userId ?? undefined);
  if (snapshot) {
    return isCapacityAssignable(snapshot.capacityPercent, snapshot.workStatus);
  }
  // null = no capacity row yet — caller may fall back to availability / heuristic.
  if (capacityByUserId && capacityByUserId.size > 0) {
    return isStaffAssignable(staff.availability);
  }
  return null;
};
