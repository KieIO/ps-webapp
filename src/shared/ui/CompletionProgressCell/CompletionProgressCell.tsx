import { Progress } from 'antd';
import type { ProgressProps } from 'antd';
import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import styles from './CompletionProgressCell.module.scss';

const VARIANT_STROKE_COLOR: Record<StatusPillVariant, string> = {
  completed: '#16a34a',
  'in-progress': '#2563eb',
  pending: '#a16207',
  overdue: '#dc2626',
  'on-leave': '#64748b',
};

export const getCompletionProgressStatus = (
  status: string,
): ProgressProps['status'] => {
  if (status === 'finish') return 'success';
  if (status === 'urgent') return 'exception';
  return 'active';
};

interface CompletionProgressCellProps {
  percent: number;
  status?: ProgressProps['status'];
  variant?: StatusPillVariant;
}

export function CompletionProgressCell({
  percent,
  status = 'active',
  variant,
}: CompletionProgressCellProps) {
  const strokeColor = variant ? VARIANT_STROKE_COLOR[variant] : undefined;

  return (
    <div className={styles.root}>
      <Progress
        percent={percent}
        size="small"
        status={variant ? undefined : status}
        strokeColor={strokeColor}
        showInfo={false}
        className={styles.progress}
      />
      <span
        className={styles.label}
        style={strokeColor ? { color: strokeColor } : undefined}
      >
        {percent}%
      </span>
    </div>
  );
}
