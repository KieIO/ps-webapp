import { ROLES, type Role } from '@/config/permissions';
import type { MyTask } from '../schemas/task.schema';
import {
  isCreativeDeptTask,
  isSplitChildTask,
  isSplitParentTask,
  resolveEffectivePipelineStage,
} from './creativePipeline';
import { isRevisionTask } from './taskRevision';

export type EvaluationWriteLayer = 'staff' | 'handoff' | 'ch';

/** Tab Evaluation + Evaluate modal — same «Đánh giá [đối tượng] (bởi [người chấm])» pattern. */
export const EVALUATION_LAYER_TITLES: Record<EvaluationWriteLayer, string> = {
  ch: 'Đánh giá Creative Head (bởi PM)',
  handoff: 'Đánh giá gói CM (bởi Creative Head)',
  staff: 'Đánh giá Staff (bởi Creative Manager)',
};

/** Short list badges — đối tượng trước; tooltip dùng `EVALUATION_LAYER_TITLES`. */
export const EVALUATION_LAYER_BADGE_LABELS: Record<EvaluationWriteLayer, string> = {
  ch: 'Đã ĐG CH',
  handoff: 'Đã ĐG gói CM',
  staff: 'Đã ĐG Staff',
};

/**
 * Creative task giao nguyên (legacy): already assigned to Staff, not split and not a revision.
 * New assigns use split (min 1 child); this shape remains readable until data is cleared.
 */
export const isCreativeWholeAssigned = (task: MyTask): boolean =>
  isCreativeDeptTask(task) &&
  !isSplitChildTask(task) &&
  !isSplitParentTask(task) &&
  !isRevisionTask(task) &&
  resolveEffectivePipelineStage(task) === 'assigned_staff';

/**
 * Parent where CH/Head may score the CM package (handoff layer):
 * legacy giao nguyên, or split parent after CM ran assign-staff.
 */
export const canEvaluateCmHandoffPackage = (task: MyTask): boolean => {
  if (!isCreativeDeptTask(task) || isSplitChildTask(task) || isRevisionTask(task)) {
    return false;
  }
  return isCreativeWholeAssigned(task) || isSplitParentTask(task);
};

/**
 * Creative parent after CH assigned a CM (awaiting_cm / assigned_staff / split).
 * PM may score Creative Head from this point (same window idea as CH→CM).
 */
export const isCreativePastChToCmHandoff = (task: MyTask): boolean => {
  if (!isCreativeDeptTask(task) || isSplitChildTask(task) || isRevisionTask(task)) {
    return false;
  }
  const stage = resolveEffectivePipelineStage(task);
  return stage === 'awaiting_cm' || stage === 'assigned_staff' || stage === 'split';
};

export const hasHandoffEvaluation = (
  task: Pick<MyTask, 'handoffCompletionPercent' | 'handoffEvaluation' | 'handoffNote'>,
): boolean =>
  task.handoffCompletionPercent != null ||
  Boolean(task.handoffEvaluation?.trim()) ||
  Boolean(task.handoffNote?.trim());

export const hasChEvaluation = (
  task: Pick<MyTask, 'chCompletionPercent' | 'chEvaluation' | 'chNote'>,
): boolean =>
  task.chCompletionPercent != null ||
  Boolean(task.chEvaluation?.trim()) ||
  Boolean(task.chNote?.trim());

/**
 * Which score a save updates.
 * - Handoff package (legacy whole or split parent): handoff (CH/Head→CM) + ch (PM→CH);
 *   staff (CM) only on legacy whole parent — split parents use children for staff scores
 * - Creative past CH→CM (incl. awaiting_cm): PM writes `ch`
 * - Other shapes: single staff score
 */
export const resolveEvaluationWriteLayer = (
  role: Role | undefined,
  task: MyTask,
  requested?: string | null,
): EvaluationWriteLayer => {
  const asked = requested?.trim() ?? '';

  if (asked === 'ch') {
    if (!isCreativePastChToCmHandoff(task)) {
      throw new Error('đánh giá Creative Head chỉ sau khi CH đã giao CM');
    }
    if (role === ROLES.ADMIN || role === ROLES.PM) return 'ch';
    throw new Error('Chỉ PM (hoặc Admin) đánh giá Creative Head');
  }

  if (canEvaluateCmHandoffPackage(task)) {
    if (isSplitParentTask(task) && role === ROLES.CREATIVE_MANAGER) {
      throw new Error('đánh giá Staff trên từng task nhỏ, không trên task đã chia');
    }

    let layer = asked;
    if (!layer) {
      if (role === ROLES.CREATIVE_MANAGER) layer = 'staff';
      else if (role === ROLES.PM) layer = 'ch';
      else if (role === ROLES.ADMIN) {
        throw new Error('chọn lớp đánh giá (staff, handoff hoặc ch)');
      } else layer = 'handoff';
    }
    if (layer !== 'staff' && layer !== 'handoff' && layer !== 'ch') {
      throw new Error('layer không hợp lệ');
    }
    if (isSplitParentTask(task) && layer === 'staff') {
      throw new Error('đánh giá Staff trên từng task nhỏ, không trên task đã chia');
    }
    if (role === ROLES.ADMIN) return layer as EvaluationWriteLayer;
    if (role === ROLES.CREATIVE_MANAGER) {
      if (layer !== 'staff') {
        throw new Error('Creative Manager đánh giá kết quả Staff, không đánh giá gói của CM');
      }
      return 'staff';
    }
    if (role === ROLES.PM) {
      if (layer !== 'ch') {
        throw new Error('PM đánh giá Creative Head, không ghi điểm Staff / gói CM');
      }
      return 'ch';
    }
    if (role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD) {
      if (layer !== 'handoff') {
        throw new Error('đánh giá gói của CM, không ghi kết quả Staff');
      }
      return 'handoff';
    }
    throw new Error('Bạn không được đánh giá task ở tầng này');
  }

  if (asked === 'handoff') {
    throw new Error('đánh giá gói CM chỉ khi CM đã giao Staff (giao nguyên hoặc đã chia task con)');
  }
  if (asked && asked !== 'staff' && asked !== 'ch') {
    throw new Error('layer không hợp lệ');
  }
  // PM / Admin on creative after CH→CM: dedicated CH score (not the staff/CM fields).
  if (
    (role === ROLES.PM || role === ROLES.ADMIN) &&
    isCreativePastChToCmHandoff(task) &&
    (!asked || asked === 'ch')
  ) {
    return 'ch';
  }
  // CH/Head never write Staff fields on Creative — only handoff on package parents.
  if ((role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD) && isCreativeDeptTask(task)) {
    throw new Error(
      'Creative Head đánh giá gói CM sau khi CM đã giao Staff (giao nguyên hoặc đã chia)',
    );
  }
  if (!canEvaluateTaskLayer(role, task)) {
    throw new Error('Bạn không được đánh giá task ở tầng này');
  }
  return 'staff';
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
 * Layered evaluation visibility / CTA:
 * - PM: project staff; creative parents only after CH→CM
 * - CH / Head: Creative handoff on giao nguyên (legacy) or split parent; never Staff fields
 * - CM: staff execution (split children or legacy whole assigned_staff)
 * - Admin: any layer
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

  if (role === ROLES.PM) {
    if (isSplitChildTask(task)) return false;
    if (isCreativeDeptTask(task)) return isCreativePastChToCmHandoff(task);
    return true;
  }

  // Creative Head / Department Head — package parent only (no split children).
  if (isSplitChildTask(task)) return false;
  if ((role === ROLES.CREATIVE_HEAD || role === ROLES.HEAD) && isCreativeDeptTask(task)) {
    return canEvaluateCmHandoffPackage(task);
  }
  return true;
};
