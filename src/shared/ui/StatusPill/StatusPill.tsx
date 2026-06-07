import classNames from 'classnames';
import styles from './StatusPill.module.scss';

export type StatusPillVariant =
  | 'completed'
  | 'in-progress'
  | 'pending'
  | 'overdue'
  | 'on-leave';

interface StatusPillProps {
  label: string;
  variant: StatusPillVariant;
  className?: string;
}

export function StatusPill({ label, variant, className }: StatusPillProps) {
  return (
    <span className={classNames(styles.pill, styles[variant], className)}>
      {label}
    </span>
  );
}
