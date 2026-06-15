import { Fragment } from 'react';
import type { PersonWithCode } from '@/features/projects/schemas/project.schema';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import styles from './ProjectMembersCell.module.scss';

interface ProjectMembersCellProps {
  members: PersonWithCode[];
  emptyClassName?: string;
}

export function ProjectMembersCell({ members, emptyClassName }: ProjectMembersCellProps) {
  if (!members.length) {
    return emptyClassName ? <span className={emptyClassName}>—</span> : null;
  }

  return (
    <span className={styles.root}>
      {members.map((member, index) => (
        <Fragment key={member.userId ?? member.code}>
          {index > 0 ? <span className={styles.separator}>, </span> : null}
          <UserNameLink name={member.name} userId={member.userId} />
        </Fragment>
      ))}
    </span>
  );
}
