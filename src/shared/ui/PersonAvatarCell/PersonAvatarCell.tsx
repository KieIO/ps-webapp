import { Avatar } from 'antd';
import { getInitials } from '@/shared/utils/person';
import styles from './PersonAvatarCell.module.scss';

interface PersonAvatarCellProps {
  name: string;
}

export function PersonAvatarCell({ name }: PersonAvatarCellProps) {
  return (
    <div className={styles.root}>
      <Avatar size={28} className={styles.avatar}>
        {getInitials(name)}
      </Avatar>
      <span>{name}</span>
    </div>
  );
}
