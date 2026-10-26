import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  isCreativeDeptTask,
  isSplitChildTask,
  isSplitParentTask,
  resolveEffectivePipelineStage,
} from './creativePipeline';
import { isRevisionTask } from './taskRevision';

export type EvaluationWriteLayer = 'staff' | 'handoff';

/**
 * Creative task giao nguyên: already assigned to Staff, not split and not a revision.
 * This is the only shape that stores two evaluations.
 */
export const isCreativeWholeAssigned = (task: MyTask): boolean =>
  isCreativeDeptTask(task) &&
  !isSplitChildTask(task) &&
  !isSplitParentTask(task) &&
  !isRevisionTask(task) &&
  resolveEffectivePipelineStage(task) === 'assigned_staff';

export const hasHandoffEvaluation = (
  task: Pick<MyTask, 'handoffCompletionPercent' | 'handoffEvaluation' | 'handoffNote'>,
): boolean =>
  task.handoffCompletionPercent != null ||
  Boolean(task.handoffEvaluation?.trim()) ||
  Boolean(task.handoffNote?.trim());

/**
 * Which score a save updates. Whole-assign keeps handoff (CH/PM/Head) and staff (CM)
 * separate. Every other task keeps the single existing score.
 */
export const resolveEvaluationWriteLayer = (
  role: Role | undefined,
  task: MyTask,
  requested?: string | null,
): EvaluationWriteLayer => {
  const asked = requested?.trim() ?? '';
  if (!isCreativeWholeAssigned(task)) {
    if (asked === 'handoff') {
      throw new Error('đánh giá gói CM chỉ áp dụng cho task giao nguyên');
    }
    if (asked && asked !== 'staff') {
      throw new Error('layer không hợp lệ');
    }
    if (!canEvaluateTaskLayer(role, task)) {
      throw new Error('Bạn không được đánh giá task ở tầng này');
    }
    return 'staff';
  }

  let layer = asked;
  if (!layer) {
    if (role === ROLES.CREATIVE_MANAGER) layer = 'staff';
    else if (role === ROLES.ADMIN) throw new Error('chọn lớp đánh giá (staff hoặc handoff)');
    else layer = 'handoff';
  }
  if (layer !== 'staff' && layer !== 'handoff') {
    throw new Error('layer không hợp lệ');
  }
  if (role === ROLES.ADMIN) return layer;
  if (role === ROLES.CREATIVE_MANAGER) {
    if (layer !== 'staff') {
      throw new Error('Creative Manager đánh giá kết quả Staff, không đánh giá gói của CM');
    }
    return 'staff';
  }
  if (role === ROLES.CREATIVE_HEAD || role === ROLES.PM || role === ROLES.HEAD) {
    if (layer !== 'handoff') {
      throw new Error('đánh giá gói của CM, không ghi kết quả Staff');
    }
    return 'handoff';
  }
  throw new Error('Bạn không được đánh giá task ở tầng này');
};

export const resolveEvaluationWriteLayerSafe = (
  role: Role | undefined,
  task: MyTask,
): EvaluationWriteLayer | undefined => {
  try {
    return resolveEvaluationWriteLayer(role, task);
  } catch {
    return undefined;
  }
};

/**
 * Layered evaluation:
 * - PM / CH / Head: parent handoff layer (not CM→staff split children)
 * - CM: staff execution (split children or whole assigned_staff)
 * - Admin: any layer (break-glass). On a whole-assign they must pick staff or handoff.
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
