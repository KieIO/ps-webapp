import type { TaskConfirmationSummary } from '../../utils/taskConfirmationSummary';
import styles from './TaskConfirmationSummaryBar.module.scss';

interface TaskConfirmationSummaryBarProps {
  summary: TaskConfirmationSummary;
}

export function TaskConfirmationSummaryBar({ summary }: TaskConfirmationSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.pillTotal}>Tổng: {summary.total}</span>
      <span className={styles.pillNotUpdated}>Chưa cập nhật: {summary.notUpdated}</span>
      <span className={styles.pillFinished}>Hoàn thành: {summary.finished}</span>
      <span className={styles.pillConfirmed}>Đã xác nhận: {summary.confirmed}</span>
      <span className={styles.pillDecline}>Từ chối: {summary.decline}</span>
    </div>
  );
}
