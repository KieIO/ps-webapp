import { STATUS_LABELS } from '../../constants';
import type { ProjectStatusSummary } from '../../utils/projectSummary';
import styles from './ProjectSummaryBar.module.scss';

interface ProjectSummaryBarProps {
  summary: ProjectStatusSummary;
}

export function ProjectSummaryBar({ summary }: ProjectSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span className={styles.pillTotal}>Tổng: {summary.total}</span>
      <span className={styles.pillNotUpdated}>
        {STATUS_LABELS.not_updated}: {summary.notUpdated}
      </span>
      <span className={styles.pillInProgress}>
        {STATUS_LABELS.in_progress}: {summary.inProgress}
      </span>
      <span className={styles.pillFinish}>
        {STATUS_LABELS.finish}: {summary.finish}
      </span>
      <span className={styles.pillCancel}>
        {STATUS_LABELS.cancel}: {summary.cancel}
      </span>
    </div>
  );
}
