import type { TaskConfirmationSummary } from '../../utils/taskConfirmationSummary';
import { CONFIRMATION_LABELS } from '@/shared/constants/taskConfirmation';
import styles from './TaskConfirmationSummaryBar.module.scss';

interface TaskConfirmationSummaryBarProps {
  summary: TaskConfirmationSummary;
}

export function TaskConfirmationSummaryBar({ summary }: TaskConfirmationSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.pillTotal}>Tổng: {summary.total}</span>
      <span className={styles.pillNotUpdated}>
        {CONFIRMATION_LABELS.not_updated}: {summary.notUpdated}
      </span>
      <span className={styles.pillFinished}>
        {CONFIRMATION_LABELS.finished}: {summary.finished}
      </span>
      <span className={styles.pillConfirmed}>
        {CONFIRMATION_LABELS.confirmed}: {summary.confirmed}
      </span>
      <span className={styles.pillDecline}>
        {CONFIRMATION_LABELS.decline}: {summary.decline}
      </span>
    </div>
  );
}
