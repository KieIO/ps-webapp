import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import { isSplitChildTask } from './creativePipeline';

/** Roles that oversee Creative handoffs and should not see CM→staff slices on Project Tasks. */
export const isOversightTaskListRole = (role: Role | undefined): boolean =>
  role === ROLES.PM || role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD || role === ROLES.ADMIN;

/** Hide CM split children from PM / CH / Head / Admin Project Tasks lists. */
export const shouldHideSplitChildFromTaskList = (task: MyTask, role: Role | undefined): boolean =>
  isOversightTaskListRole(role) && isSplitChildTask(task);

export const filterTasksForViewerRole = (tasks: MyTask[], role: Role | undefined): MyTask[] =>
  tasks.filter((task) => !shouldHideSplitChildFromTaskList(task, role));
