export type CapacityProgressVariant = 'completed' | 'in-progress' | 'overdue';

export const getCapacityProgressVariant = (percent: number): CapacityProgressVariant => {
  if (percent > 100) return 'overdue';
  if (percent >= 80) return 'in-progress';
  return 'completed';
};
