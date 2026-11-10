import { Fragment } from 'react';
import { UNASSIGNED_STAFF_LABEL } from '../../constants';
import type { TaskAssignee } from '../../schemas/task.schema';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import styles from './TaskStaffNameCell.module.scss';

interface TaskStaffNameCellProps {
  staff: TaskAssignee[];
  showAvatarForFirst?: boolean;
  /** When set, show plain text (no avatar / user links). */
  plainLabel?: string | null;
}

export function TaskStaffNameCell({
  staff,
  showAvatarForFirst = false,
  plainLabel,
}: TaskStaffNameCellProps) {
  if (plainLabel) {
    return <span className={styles.plain}>{plainLabel}</span>;
  }

  if (!staff.length) {
    return <span className={styles.empty}>{UNASSIGNED_STAFF_LABEL}</span>;
  }

  return (
    <span className={styles.root}>
      {staff.map((member, index) => (
        <Fragment key={member.userId ?? member.code}>
          {index > 0 ? <span className={styles.separator}>, </span> : null}
          <UserNameLink
            name={member.name}
            userId={member.userId}
            showAvatar={showAvatarForFirst && index === 0}
          />
        </Fragment>
      ))}
    </span>
  );
}
