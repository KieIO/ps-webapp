import { DEPARTMENT_LABELS } from '@/features/users/constants';
import { JOB_LEVEL_SORT_ORDER, type WorkStatus } from '../constants';
import type { EmployeeCapacity } from '../schemas/capacity.schema';

const WORK_STATUS_SORT_ORDER: Record<WorkStatus, number> = {
  working: 0,
  off: 1,
};

export const compareEmployeeName = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  a.name.localeCompare(b.name, 'vi');

export const compareDepartment = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  DEPARTMENT_LABELS[a.department].localeCompare(DEPARTMENT_LABELS[b.department], 'vi');

export const compareJobLevel = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  JOB_LEVEL_SORT_ORDER[a.jobLevel] - JOB_LEVEL_SORT_ORDER[b.jobLevel];

export const comparePositionCode = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  a.positionCode.localeCompare(b.positionCode, 'vi');

export const compareJobTitleName = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  a.jobTitleName.localeCompare(b.jobTitleName, 'vi');

export const compareSpecialistTaskPoints = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  a.specialistTaskPoints - b.specialistTaskPoints;

export const compareAchievedTaskPoints = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  a.achievedTaskPoints - b.achievedTaskPoints;

export const compareWorkStatus = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  WORK_STATUS_SORT_ORDER[a.workStatus] - WORK_STATUS_SORT_ORDER[b.workStatus];

export const compareCapacityPercent = (a: EmployeeCapacity, b: EmployeeCapacity) =>
  (a.capacityPercent ?? -1) - (b.capacityPercent ?? -1);
