import { Progress } from 'antd';
import classNames from 'classnames';
import { STATUS_VARIANT_STROKE_COLOR } from '@/shared/ui/StatusPill/statusVariantColors';
import {
  AvgCapacityTooltipContent,
  CapacityHelpTooltip,
} from '../CapacityHelpTooltip/CapacityHelpTooltip';
import { getCapacityProgressVariant, type CapacityProgressVariant } from '../../utils/capacityProgress';
import styles from './CapacitySummaryBar.module.scss';

const VARIANT_VALUE_CLASS: Record<CapacityProgressVariant, string> = {
  completed: styles.valueCompleted,
  'in-progress': styles.valueInProgress,
  overdue: styles.valueOverdue,
};

interface CapacitySummaryBarProps {
  averagePercent: number;
  periodLabel: string;
  isPeriodView?: boolean;
}

export function CapacitySummaryBar({
  averagePercent,
  periodLabel,
  isPeriodView = false,
}: CapacitySummaryBarProps) {
  const variant = getCapacityProgressVariant(averagePercent);

  return (
    <div className={styles.bar}>
      <div className={styles.metric}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Avg capacity</span>
          <CapacityHelpTooltip
            title={<AvgCapacityTooltipContent periodLabel={periodLabel} isPeriodView={isPeriodView} />}
            ariaLabel="Cách tính Avg capacity"
          />
        </div>
        <span className={classNames(styles.value, VARIANT_VALUE_CLASS[variant])}>
          {averagePercent}%
        </span>
      </div>

      <Progress
        percent={averagePercent}
        showInfo={false}
        strokeColor={STATUS_VARIANT_STROKE_COLOR[variant]}
        strokeLinecap="round"
        className={styles.progress}
      />

      <div className={styles.meta}>
        <span className={styles.metaText}>Team average for {periodLabel}</span>
      </div>
    </div>
  );
}
