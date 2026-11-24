import classNames from 'classnames';
import {
  CM_STAFF_ASSIGN_BUCKET_LABELS,
  CM_STAFF_ASSIGN_BUCKET_ORDER,
  type CmStaffAssignBucket,
  type CmStaffAssignSummary,
} from '../../utils/cmStaffAssignSummary';
import styles from './CmStaffAssignSummaryBar.module.scss';

interface CmStaffAssignSummaryBarProps {
  summary: CmStaffAssignSummary;
  activeBucket?: CmStaffAssignBucket;
  onBucketChange: (bucket: CmStaffAssignBucket | undefined) => void;
}

const PILL_CLASS: Record<CmStaffAssignBucket, string> = {
  needsAssign: styles.pillNeedsAssign,
  assigned: styles.pillAssigned,
  completed: styles.pillCompleted,
};

export function CmStaffAssignSummaryBar({
  summary,
  activeBucket,
  onBucketChange,
}: CmStaffAssignSummaryBarProps) {
  const toggle = (bucket: CmStaffAssignBucket) => {
    onBucketChange(activeBucket === bucket ? undefined : bucket);
  };

  return (
    <div className={styles.bar} role="group" aria-label="Phân loại Giao Staff">
      <button
        type="button"
        className={classNames(styles.pillTotal, {
          [styles.pillActive]: activeBucket == null,
        })}
        aria-pressed={activeBucket == null}
        onClick={() => onBucketChange(undefined)}
      >
        Tổng: {summary.total}
      </button>
      {CM_STAFF_ASSIGN_BUCKET_ORDER.map((bucket) => (
        <button
          key={bucket}
          type="button"
          className={classNames(PILL_CLASS[bucket], {
            [styles.pillActive]: activeBucket === bucket,
          })}
          aria-pressed={activeBucket === bucket}
          onClick={() => toggle(bucket)}
        >
          {CM_STAFF_ASSIGN_BUCKET_LABELS[bucket]}: {summary[bucket]}
        </button>
      ))}
    </div>
  );
}
