/**
 * Evaluate-by-quantity helpers: % is derived from completed / assigned.
 * Percent stays the persisted field; completed quantity is UI input (whole units).
 */

export const computeCompletionPercentFromQuantity = (
  completedQuantity: number,
  assignedQuantity: number,
): number => {
  if (assignedQuantity <= 0) return 0;
  const raw = (completedQuantity / assignedQuantity) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
};

/** Reverse of percent ↔ quantity for reopening the evaluate form (integer units). */
export const deriveCompletedQuantityFromPercent = (
  completionPercent: number | null | undefined,
  assignedQuantity: number,
): number => {
  if (assignedQuantity <= 0 || completionPercent == null) return 0;
  return Math.round((completionPercent / 100) * assignedQuantity);
};
