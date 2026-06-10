import classNames from 'classnames';
import { getTaskNameVariant } from '../../utils/taskName';
import styles from './TaskNameBadge.module.scss';

interface TaskNameBadgeProps {
  name: string;
  className?: string;
}

export function TaskNameBadge({ name, className }: TaskNameBadgeProps) {
  const variant = getTaskNameVariant(name);

  return (
    <span className={classNames(styles.badge, styles[variant], className)}>
      {name}
    </span>
  );
}
