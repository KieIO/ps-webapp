import {
  TASK_SUMMARY_BUCKET_LABELS,
  type TaskConfirmationSummary,
} from '../../utils/taskConfirmationSummary';
import styles from './TaskConfirmationSummaryBar.module.scss';

interface TaskConfirmationSummaryBarProps {
  summary: TaskConfirmationSummary;
}

export function TaskConfirmationSummaryBar({ summary }: TaskConfirmationSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.pillTotal}>Tổng: {summary.total}</span>
      <span className={styles.pillUnconfirmed}>
        {TASK_SUMMARY_BUCKET_LABELS.unconfirmed}: {summary.unconfirmed}
      </span>
      <span className={styles.pillInProgress}>
        {TASK_SUMMARY_BUCKET_LABELS.inProgress}: {summary.inProgress}
      </span>
      <span className={styles.pillNeedsEvaluation}>
        {TASK_SUMMARY_BUCKET_LABELS.needsEvaluation}: {summary.needsEvaluation}
      </span>
      <span className={styles.pillDeclined}>
        {TASK_SUMMARY_BUCKET_LABELS.declined}: {summary.declined}
      </span>
      <span className={styles.pillCancelled}>
        {TASK_SUMMARY_BUCKET_LABELS.cancelled}: {summary.cancelled}
      </span>
      <span className={styles.pillCompleted}>
        {TASK_SUMMARY_BUCKET_LABELS.completed}: {summary.completed}
      </span>
    </div>
  );
}
