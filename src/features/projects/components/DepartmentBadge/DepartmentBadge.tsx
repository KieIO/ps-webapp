import classNames from 'classnames';
import { DEPARTMENT_LABELS } from '../../constants';
import type { ProjectDepartment } from '../../schemas/project.schema';
import styles from './DepartmentBadge.module.scss';

interface DepartmentBadgeProps {
  department: ProjectDepartment;
  className?: string;
}

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[department], className)}>
      {DEPARTMENT_LABELS[department]}
    </span>
  );
}
