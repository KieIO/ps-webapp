import classNames from 'classnames';
import { DEPARTMENT_LABELS } from '../../constants';
import type { UserDepartment } from '../../constants';
import styles from './DepartmentBadge.module.scss';

interface DepartmentBadgeProps {
  department: UserDepartment;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[department], className)}>
      {DEPARTMENT_LABELS[department]}
    </span>
  );
}
