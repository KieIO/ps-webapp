import type { MyTask } from '../schemas/task.schema';
import { isSplitChildTask } from './creativePipeline';

export const computeAcceptedRemainderQuantity = (
  assignedQuantity: number,
  acceptedQuantity: number,
): number => {
  if (assignedQuantity <= 0) return 0;
  const accepted = Math.min(
    Math.max(0, Math.round(acceptedQuantity)),
    Math.round(assignedQuantity),
  );
  return Math.round(assignedQuantity) - accepted;
};

/**
 * CM may spawn a remainder sibling when evaluating a finished split child
 * and accepting strictly less than the assigned quantity.
 */
export const canSpawnEvaluationRemainder = (task: MyTask, acceptedQuantity: number): boolean => {
  if (!isSplitChildTask(task)) return false;
  if (task.staffConfirmation !== 'finished') return false;
  if (!task.parentTaskId) return false;
  if (task.evaluationRemainderTaskId) return false;
  const assigned = Math.round(task.quantity ?? 0);
  if (assigned <= 0) return false;
  const accepted = Math.round(acceptedQuantity);
  if (accepted < 0 || accepted >= assigned) return false;
  return true;
};

/** Default evaluate note after CM accepts a partial quantity and spawns a remainder. */
export const buildEvaluationRemainderAutoNote = (input: {
  acceptedQuantity: number;
  originalAssignedQuantity: number;
  remainderTaskCode: string;
  remainderQuantity: number;
}): string =>
  `CM chấp nhận ${Math.round(input.acceptedQuantity)}/${Math.round(input.originalAssignedQuantity)} · đã tạo ${input.remainderTaskCode} (${Math.round(input.remainderQuantity)})`;

export const hasCmEvaluation = (
  task: Pick<MyTask, 'completionPercent' | 'pmEvaluation'>,
): boolean => task.completionPercent != null || Boolean(task.pmEvaluation?.trim());

/**
 * Partial-acceptance label after remainder spawn only (`Đạt 3/15`).
 * Null for plain evaluate — avoids redundant `Đạt 40` next to Quantity 40.
 */
export const formatEvaluationAcceptedLabel = (
  task: Pick<MyTask, 'quantity' | 'originalAssignedQuantity'>,
): string | null => {
  const original =
    task.originalAssignedQuantity != null ? Math.round(task.originalAssignedQuantity) : null;
  if (original == null || original <= 0) return null;
  const accepted = Math.round(task.quantity ?? 0);
  return `Đạt ${accepted}/${original}`;
};

/** Plain evaluate badge (no remainder spawn). Prefer VN over mixed “Đã evaluate”. */
export const EVALUATED_BADGE_LABEL = 'Đã đánh giá';

/** List/detail badge: `Đạt x/y` after spawn, otherwise `Đã đánh giá`. */
export const formatEvaluationBadgeLabel = (
  task: Pick<MyTask, 'quantity' | 'originalAssignedQuantity'>,
): string => formatEvaluationAcceptedLabel(task) ?? EVALUATED_BADGE_LABEL;

/** Next `-S{n}` code under a split parent (max existing index + 1). */
export const nextSplitChildTaskCode = (parentTaskCode: string, siblings: MyTask[]): string => {
  const escaped = parentTaskCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped}-S(\\d+)$`, 'i');
  let max = 0;
  for (const sibling of siblings) {
    const match = sibling.taskCode.match(pattern);
    if (!match) continue;
    max = Math.max(max, Number(match[1]));
  }
  return `${parentTaskCode}-S${max + 1}`;
};
