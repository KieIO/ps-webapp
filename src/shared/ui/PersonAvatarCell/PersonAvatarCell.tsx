import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { buildUserDetailPath } from '@/config/constants';
import { getInitials } from '@/shared/utils/person';
import classNames from 'classnames';
import styles from './PersonAvatarCell.module.scss';

interface PersonAvatarCellProps {
  name: string;
  userId?: string | null;
  className?: string;
}

export function PersonAvatarCell({ name, userId, className }: PersonAvatarCellProps) {
  const content = (
    <>
      <Avatar size={28} className={styles.avatar}>
        {getInitials(name)}
      </Avatar>
      <span>{name}</span>
    </>
  );

  if (userId) {
    return (
      <Link
        to={buildUserDetailPath(userId)}
        className={classNames(styles.root, styles.link, className)}
      >
        {content}
      </Link>
    );
  }

  return <div className={classNames(styles.root, className)}>{content}</div>;
}
