import type { MyTask, TaskConfirmationStatus, TaskKind } from '../schemas/task.schema';

/** Statuses that block creating another revision on the same parent. */
export const ACTIVE_REVISION_CONFIRMATIONS = new Set<TaskConfirmationStatus>([
  'not_updated',
  'confirmed',
  'decline',
]);

export type RequestRevisionBlockReason =
  | 'no_permission'
  | 'finished'
  | 'cancelled'
  | 'no_assignee'
  | 'is_revision'
  | 'active_revision_exists';

export const REQUEST_REVISION_BLOCK_MESSAGES: Record<RequestRevisionBlockReason, string> = {
  no_permission: 'Bạn không có quyền yêu cầu revision.',
  finished: 'Chưa hỗ trợ tạo revision khi task đã finished.',
  cancelled: 'Không tạo revision khi task đã hủy.',
  no_assignee: 'Task chưa có người nhận. Không thể tạo revision.',
  is_revision: 'Không tạo revision trên một revision subtask.',
  active_revision_exists:
    'Đang có revision chưa hoàn tất. Mỗi task chỉ mở 1 revision tại một thời điểm.',
};

export const REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE =
  'Deadline phải vào ngày tính workload hoặc sau đó';

const ISO_DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** First 10 chars when the value is YYYY-MM-DD or an ISO datetime. */
export function calendarDateKey(value: string): string | null {
  const key = value.trim().slice(0, 10);
  return ISO_DATE_KEY.test(key) ? key : null;
}

/** Inclusive calendar-day compare: deadline date ≥ work date. */
export function isRevisionDeadlineOnOrAfterWorkDate(workDate: string, deadline: string): boolean {
  const workKey = calendarDateKey(workDate);
  const deadlineKey = calendarDateKey(deadline);
  if (!workKey || !deadlineKey) return false;
  return deadlineKey >= workKey;
}

export function resolveTaskKind(task: Pick<MyTask, 'taskKind' | 'parentTaskId'>): TaskKind {
  if (task.taskKind) return task.taskKind;
  if (task.parentTaskId) return 'split';
  return 'original';
}

export function isRevisionTask(task: Pick<MyTask, 'taskKind' | 'parentTaskId'>): boolean {
  return resolveTaskKind(task) === 'revision';
}

export function isSplitTask(task: Pick<MyTask, 'taskKind' | 'parentTaskId'>): boolean {
  return resolveTaskKind(task) === 'split';
}

/** Direct revision children of a parent (not recursive). */
export function getDirectRevisionChildren(parentId: string, tasks: readonly MyTask[]): MyTask[] {
  return tasks
    .filter((task) => task.parentTaskId === parentId && isRevisionTask(task))
    .sort((a, b) => {
      const roundDiff = (b.revisionRound ?? 0) - (a.revisionRound ?? 0);
      if (roundDiff !== 0) return roundDiff;
      return (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date);
    });
}

export function getNextRevisionRound(parentId: string, tasks: readonly MyTask[]): number {
  const children = getDirectRevisionChildren(parentId, tasks);
  if (children.length === 0) return 1;
  return Math.max(...children.map((child) => child.revisionRound ?? 0)) + 1;
}

export function findActiveRevision(parentId: string, tasks: readonly MyTask[]): MyTask | undefined {
  return getDirectRevisionChildren(parentId, tasks).find((task) =>
    ACTIVE_REVISION_CONFIRMATIONS.has(task.staffConfirmation),
  );
}

export function hasActiveRevision(parentId: string, tasks: readonly MyTask[]): boolean {
  return findActiveRevision(parentId, tasks) != null;
}

/**
 * Capacity rule (FE helper for UI copy / future filters):
 * cancelled revisions do not count toward capacity.
 */
export function revisionCountsTowardCapacity(
  task: Pick<MyTask, 'taskKind' | 'parentTaskId' | 'staffConfirmation'>,
): boolean {
  if (!isRevisionTask(task)) return true;
  if (task.staffConfirmation === 'cancelled') return false;
  return true;
}

export function getRequestRevisionBlockReason(
  task: MyTask,
  revisionChildren: readonly MyTask[],
  canEvaluate: boolean,
): RequestRevisionBlockReason | null {
  if (!canEvaluate) return 'no_permission';
  if (isRevisionTask(task)) return 'is_revision';
  if (task.staffConfirmation === 'finished') return 'finished';
  if (task.staffConfirmation === 'cancelled') return 'cancelled';
  if (!task.staff.some((member) => Boolean(member.userId || member.code))) {
    return 'no_assignee';
  }
  if (hasActiveRevision(task.id, revisionChildren)) return 'active_revision_exists';
  return null;
}

export function canRequestRevision(
  task: MyTask,
  revisionChildren: readonly MyTask[],
  canEvaluate: boolean,
): boolean {
  return getRequestRevisionBlockReason(task, revisionChildren, canEvaluate) == null;
}

export function formatRevisionLabel(task: Pick<MyTask, 'revisionRound'>): string {
  const round = task.revisionRound ?? 1;
  return `Revision #${round}`;
}

/** List badge for a parent that has one or more revision children. */
export function formatHasRevisionChildrenLabel(
  count: number,
  options?: { activeCount?: number },
): string {
  if (count <= 0) return '';
  const activeCount = options?.activeCount ?? 0;
  if (activeCount > 0) {
    return activeCount === 1 ? 'Đang revision' : `Đang ${activeCount} revision`;
  }
  if (count === 1) return 'Có revision';
  return `Có ${count} revision`;
}

export function hasRevisionChildren(
  task: Pick<MyTask, 'revisionChildCount' | 'taskKind' | 'parentTaskId'>,
): boolean {
  if (isRevisionTask(task)) return false;
  return (task.revisionChildCount ?? 0) > 0;
}

export function hasActiveRevisionChildren(
  task: Pick<MyTask, 'activeRevisionChildCount' | 'taskKind' | 'parentTaskId'>,
): boolean {
  if (isRevisionTask(task)) return false;
  return (task.activeRevisionChildCount ?? 0) > 0;
}

/**
 * While an open revision owns the redo workflow, parent status / edit / evaluate
 * should happen on the revision task instead.
 */
export const PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION =
  'Đang có revision chưa hoàn tất. Cập nhật trạng thái, nội dung và đánh giá trên revision.';

export function areParentActionsLockedByActiveRevision(
  task: Pick<MyTask, 'activeRevisionChildCount' | 'taskKind' | 'parentTaskId'>,
): boolean {
  return hasActiveRevisionChildren(task);
}

/**
 * Best-effort parent code from a revision task code (`PM-GOWARE-008-R1` → `PM-GOWARE-008`).
 * Used when we only have the child row and need a human-readable parent label.
 */
export function inferParentTaskCodeFromRevision(taskCode: string): string | null {
  const trimmed = taskCode.trim();
  const match = /^(.*)-R\d+$/i.exec(trimmed);
  if (!match?.[1]) return null;
  return match[1];
}

/**
 * Option A: revision quantity may be lower (partial), equal, or higher (expanded scope)
 * than the parent task. Only hard rule: must be > 0.
 * Parent quantity is reference for UX / capacity messaging — never a hard max.
 */
export type RevisionQuantityRelation = 'partial' | 'same' | 'expanded';

export function compareRevisionQuantityToParent(
  quantity: number,
  parentQuantity: number,
): RevisionQuantityRelation {
  if (quantity < parentQuantity) return 'partial';
  if (quantity > parentQuantity) return 'expanded';
  return 'same';
}

export function assertRevisionQuantity(quantity: number): void {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Số lượng phải lớn hơn 0');
  }
}

export function formatRevisionQuantityExtra(parentQuantity: number): string {
  return `Gốc: ${parentQuantity}. Có thể ít hơn hoặc nhiều hơn.`;
}

export function revisionQuantityExpandedCapacityHint(
  quantity: number,
  parentQuantity: number,
): string | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (compareRevisionQuantityToParent(quantity, parentQuantity) !== 'expanded') return null;
  return `Số lượng ${quantity} lớn hơn gốc ${parentQuantity}. Workload và capacity của revision sẽ cao hơn task gốc.`;
}
