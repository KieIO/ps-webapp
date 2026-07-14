/** Days remaining (inclusive) for project deadline-risk KPI. */
export const DEADLINE_RISK_DAYS = 3;

/** Capacity % above this threshold counts as overloaded. */
export const OVERLOAD_CAPACITY_THRESHOLD = 90;

export const HOME_WORKLOAD_STATUS = {
  GOOD: 'good',
  NORMAL: 'normal',
  OVERLOADED: 'overloaded',
} as const;

export type HomeWorkloadStatus = (typeof HOME_WORKLOAD_STATUS)[keyof typeof HOME_WORKLOAD_STATUS];

export const HOME_WORKLOAD_STATUS_LABELS: Record<HomeWorkloadStatus, string> = {
  [HOME_WORKLOAD_STATUS.GOOD]: 'Tốt',
  [HOME_WORKLOAD_STATUS.NORMAL]: 'Bình thường',
  [HOME_WORKLOAD_STATUS.OVERLOADED]: 'Quá tải',
};

/** Placeholder copy — replace when OT / notification formulas arrive. */
export const HOME_PLACEHOLDER_COMING_SOON = 'Coming soon';

export const HOME_PLACEHOLDER_FORMULA_NOTE = 'Công thức sẽ bổ sung — đánh dấu để quay lại sau';
