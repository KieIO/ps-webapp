import classNames from 'classnames';
import { PROJECT_URGENCY_STYLES } from '../../constants';
import type { ProjectUrgencyColor } from '../../schemas/project.schema';
import styles from './ProjectUrgencyBadge.module.scss';

interface ProjectUrgencyBadgeProps {
  /** Display color only — resolve `auto` before passing. */
  urgency: ProjectUrgencyColor;
  className?: string;
}

export function ProjectUrgencyBadge({ urgency, className }: ProjectUrgencyBadgeProps) {
  const { dot, label } = PROJECT_URGENCY_STYLES[urgency];

  return (
    <span className={classNames(styles.badge, className)}>
      <span
        className={styles.dot}
        style={{
          backgroundColor: dot,
          boxShadow: urgency === 'gray' ? 'inset 0 0 0 1px #D1D5DB' : undefined,
        }}
        aria-hidden
      />
      {label}
    </span>
  );
}
