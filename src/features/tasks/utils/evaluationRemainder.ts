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
  const assigned = Math.round(task.quantity ?? 0);
  if (assigned <= 0) return false;
  const accepted = Math.round(acceptedQuantity);
  if (accepted < 0 || accepted >= assigned) return false;
  return true;
};

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
