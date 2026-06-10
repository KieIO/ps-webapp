import type { ProjectStatusSummary } from '../../utils/projectSummary';
import styles from './ProjectSummaryBar.module.scss';

interface ProjectSummaryBarProps {
  summary: ProjectStatusSummary;
}

export function ProjectSummaryBar({ summary }: ProjectSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.pillTotal}>Tổng: {summary.total}</span>
      <span className={styles.pillNotUpdated}>Chưa cập nhật: {summary.notUpdated}</span>
      <span className={styles.pillInProgress}>Đang làm: {summary.inProgress}</span>
      <span className={styles.pillFinish}>Hoàn thành: {summary.finish}</span>
      <span className={styles.pillCancel}>Đã hủy: {summary.cancel}</span>
    </div>
  );
}
