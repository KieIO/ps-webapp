import classNames from 'classnames';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import { useDepartmentOptions } from '@/features/departments/hooks/useDepartmentOptions';
import { DEPARTMENT_LABELS } from '../../constants';
import type { ProjectDepartment } from '../../schemas/project.schema';
import styles from './DepartmentBadge.module.scss';

interface DepartmentBadgeProps {
  department: string;
  className?: string;
}

const KNOWN_STYLE_KEYS = new Set(Object.keys(DEPARTMENT_LABELS));

export function DepartmentBadge({ department, className }: DepartmentBadgeProps) {
  const { labelByCode } = useDepartmentOptions();
  const styleKey = KNOWN_STYLE_KEYS.has(department) ? department : 'project';

  return (
    <span className={classNames(styles.badge, styles[styleKey as ProjectDepartment], className)}>
      {getDepartmentLabel(department, labelByCode)}
    </span>
  );
}
