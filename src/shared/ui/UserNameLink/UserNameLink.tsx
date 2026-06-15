import { Avatar, Button } from 'antd';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { buildUserDetailPath } from '@/config/constants';
import { getInitials } from '@/shared/utils/person';
import styles from './UserNameLink.module.scss';

interface UserNameLinkProps {
  name: string;
  userId?: string | null;
  showAvatar?: boolean;
}

export function UserNameLink({ name, userId, showAvatar = false }: UserNameLinkProps) {
  const navigate = useNavigate();

  const avatar = showAvatar ? (
    <span className={styles.withAvatar}>
      <Avatar size={28} className={styles.avatar}>
        {getInitials(name)}
      </Avatar>
      <span className={styles.name}>{name}</span>
    </span>
  ) : null;

  if (!userId) {
    return showAvatar ? (
      <span className={styles.withAvatar}>
        <Avatar size={28} className={styles.avatar}>
          {getInitials(name)}
        </Avatar>
        <span className={styles.name}>{name}</span>
      </span>
    ) : (
      <span className={styles.name}>{name}</span>
    );
  }

  return (
    <Button
      type="link"
      className={classNames(styles.link, showAvatar && styles.linkWithAvatar)}
      onClick={() => navigate(buildUserDetailPath(userId))}
    >
      {showAvatar ? avatar : name}
    </Button>
  );
}
