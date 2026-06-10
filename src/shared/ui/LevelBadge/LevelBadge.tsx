import classNames from 'classnames';
import styles from './LevelBadge.module.scss';

interface LevelBadgeProps {
  level: 1 | 2 | 3 | 4;
  label: string;
  className?: string;
}

export function LevelBadge({ level, label, className }: LevelBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[`level${level}`], className)}>
      {label}
    </span>
  );
}
