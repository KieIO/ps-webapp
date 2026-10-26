import { ROLES, type Role } from '@/config/permissions';
import type { TaskPerson } from '../schemas/task.schema';

/** A signed-in project manager may only put themselves on a new task. */
export const isCreateTaskPmLockedToSelf = (role: Role | string | undefined): boolean =>
  role === ROLES.PM;

/**
 * Create-task PM picker.
 * PM sees only their own row. Admin and other roles keep the full list.
 */
export const pmOptionsForCreateTask = (
  options: readonly TaskPerson[],
  user: { id?: string; name?: string; role?: string } | null | undefined,
): TaskPerson[] => {
  if (!isCreateTaskPmLockedToSelf(user?.role) || !user?.id) {
    return [...options];
  }

  const name = user.name?.trim().toLowerCase() ?? '';
  const match = options.find(
    (entry) =>
      entry.userId === user.id || (name !== '' && entry.name.trim().toLowerCase() === name),
  );
  if (!match) return [];

  return [
    {
      code: match.code,
      name: match.name,
      userId: match.userId ?? user.id,
    },
  ];
};
