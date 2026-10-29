/**
 * Evaluate-by-quantity helpers: % is derived from completed / assigned.
 * Percent stays the persisted field; completed quantity is UI input (whole units).
 *
 * Percent is stored with enough precision that reverse(derive) returns the same
 * integer quantity (integer % would collapse 17/117 and 18/117 both to 15%).
 */

export const computeCompletionPercentFromQuantity = (
  completedQuantity: number,
  assignedQuantity: number,
): number => {
  if (assignedQuantity <= 0) return 0;
  const raw = (completedQuantity / assignedQuantity) * 100;
  return Math.min(100, Math.max(0, raw));
};

/** Reverse of percent ↔ quantity for reopening the evaluate form (integer units). */
export const deriveCompletedQuantityFromPercent = (
  completionPercent: number | null | undefined,
  assignedQuantity: number,
): number => {
  if (assignedQuantity <= 0 || completionPercent == null) return 0;
  return Math.round((completionPercent / 100) * assignedQuantity);
};

/** Display helper — UI still shows a whole-number percent. */
export const formatCompletionPercentDisplay = (
  completionPercent: number | null | undefined,
): string => {
  if (completionPercent == null) return '—';
  return `${Math.round(completionPercent)}%`;
};
