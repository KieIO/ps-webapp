import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  isCreativeDeptTask,
  isSplitChildTask,
  isSplitParentTask,
  resolveEffectivePipelineStage,
} from './creativePipeline';

/**
 * Layered evaluation (no new fields):
 * - PM / CH / Head: parent handoff layer (not CM→staff split children)
 * - CM: staff execution (split children or whole assigned_staff)
 * - Admin: any layer (break-glass)
 */
export const canEvaluateTaskLayer = (role: Role | undefined, task: MyTask): boolean => {
  if (!role || role === ROLES.EMPLOYEE) return false;
  if (role === ROLES.ADMIN) return true;

  if (role === ROLES.CREATIVE_MANAGER) {
    if (isSplitChildTask(task)) return true;
    if (isSplitParentTask(task)) return false;
    if (!isCreativeDeptTask(task)) return true;
    return resolveEffectivePipelineStage(task) === 'assigned_staff';
  }

  // PM, Creative Head, Department Head — parent / handoff only
  if (isSplitChildTask(task)) return false;
  return true;
};
