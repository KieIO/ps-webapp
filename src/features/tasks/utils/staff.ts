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

/** Resolves a single staff select value into a 0–1 length assignee array for the API. */
export const resolveStaffFromUserId = (
  userId: string | undefined,
  options: TaskAssignee[],
  fallbackStaff: TaskAssignee[] = [],
): TaskAssignee[] => {
  if (!userId) return [];

  const lookup = new Map<string, TaskAssignee>();
  for (const staff of [...options, ...fallbackStaff]) {
    lookup.set(staffOptionKey(staff), staff);
  }

  const staff = lookup.get(userId);
  return staff ? [staff] : [];
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
      label: staff.name,
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
