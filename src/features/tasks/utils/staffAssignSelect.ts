import type { MyTask, StaffAvailability, TaskAssignee } from '../schemas/task.schema';
import type { AssignCapacitySnapshot } from './assignCapacity';
import {
  canSelectAssignee,
  displayCapacityPercent,
  getAssigneeWorkload,
  resolveAssigneeAvailability,
} from './creativePipeline';
import { staffOptionKey } from './staff';

export type CapacityStaffSelectOption = {
  value: string;
  label: string;
  disabled: boolean;
  staff: TaskAssignee;
  activeCount: number;
  capacityPercent: number;
  availability: StaffAvailability | undefined;
};

/**
 * Staff Select options with capacity % + active task count (same shape as Creative assign pickers).
 */
export const buildCapacityStaffSelectOptions = (
  staffList: TaskAssignee[],
  allTasks: MyTask[],
  capacityByUserId?: Map<string, AssignCapacitySnapshot>,
): CapacityStaffSelectOption[] =>
  staffList.map((staff) => {
    const userId = staff.userId ?? undefined;
    const workload = getAssigneeWorkload(allTasks, userId);
    return {
      value: staffOptionKey(staff),
      label: staff.name,
      disabled: !canSelectAssignee(staff, allTasks, capacityByUserId),
      staff,
      activeCount: workload.activeCount,
      capacityPercent: displayCapacityPercent(staff, allTasks, capacityByUserId),
      availability: resolveAssigneeAvailability(staff, capacityByUserId),
    };
  });
