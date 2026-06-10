import { UNASSIGNED_STAFF_LABEL } from '../constants';
import type { TaskAssignee } from '../schemas/task.schema';

export const staffOptionKey = (staff: TaskAssignee): string => staff.userId ?? staff.code;

export const formatTaskStaffNames = (
  staff: TaskAssignee[] | null | undefined,
  emptyLabel = UNASSIGNED_STAFF_LABEL,
): string => {
  if (!staff?.length) return emptyLabel;
  return staff.map((member) => member.name).join(', ');
};

export const resolveStaffFromUserIds = (
  userIds: string[],
  options: TaskAssignee[],
  fallbackStaff: TaskAssignee[] = [],
): TaskAssignee[] => {
  const lookup = new Map<string, TaskAssignee>();
  for (const staff of [...options, ...fallbackStaff]) {
    lookup.set(staffOptionKey(staff), staff);
  }

  return userIds
    .map((id) => lookup.get(id))
    .filter((staff): staff is TaskAssignee => staff != null);
};

export const mergeStaffSelectOptions = (
  staffOptions: TaskAssignee[],
  currentStaff: TaskAssignee[] = [],
): { value: string; label: string }[] => {
  const seen = new Set<string>();
  const options: { value: string; label: string }[] = [];

  const addOption = (staff: TaskAssignee) => {
    const key = staffOptionKey(staff);
    if (seen.has(key)) return;
    seen.add(key);
    options.push({
      value: key,
      label: `${staff.code} — ${staff.name}`,
    });
  };

  for (const staff of staffOptions) {
    addOption(staff);
  }
  for (const staff of currentStaff) {
    addOption(staff);
  }

  return options;
};
