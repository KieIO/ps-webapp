import classNames from 'classnames';
import { JOB_LEVEL_LABELS, type JobLevel } from '../../constants';
import styles from './JobLevelBadge.module.scss';

interface JobLevelBadgeProps {
  level: JobLevel;
  className?: string;
}

export function JobLevelBadge({ level, className }: JobLevelBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[level], className)}>
      {JOB_LEVEL_LABELS[level]}
    </span>
  );
}
