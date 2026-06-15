import { Progress } from 'antd';
import type { ProgressProps } from 'antd';
import type { StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import { STATUS_VARIANT_STROKE_COLOR } from '@/shared/ui/StatusPill/statusVariantColors';
import styles from './CompletionProgressCell.module.scss';

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
  const strokeColor = variant ? STATUS_VARIANT_STROKE_COLOR[variant] : undefined;

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
