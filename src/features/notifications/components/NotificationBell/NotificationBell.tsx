import { useState } from 'react';
import { Badge, Button, Popover } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
} from '../../hooks/useNotifications';
import { NotificationFeed } from '../NotificationFeed/NotificationFeed';
import styles from './NotificationBell.module.scss';

const BELL_PREVIEW_LIMIT = 8;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const listQuery = useNotificationList(BELL_PREVIEW_LIMIT);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = listQuery.data?.unreadCount ?? 0;
  const items = listQuery.data?.items ?? [];

  const content = (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>Thông báo</p>
          <p className={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã xem hết'}
          </p>
        </div>
        <Button
          type="link"
          size="small"
          disabled={unreadCount === 0 || markAll.isPending}
          onClick={() => markAll.mutate()}
        >
          Đánh dấu đã đọc
        </Button>
      </div>

      <div className={styles.feed}>
        <NotificationFeed
          items={items}
          isLoading={listQuery.isLoading || listQuery.isFetching}
          dense
          onItemClick={(item) => {
            if (!item.isRead) markRead.mutate(item.id);
            setOpen(false);
          }}
        />
      </div>

      <div className={styles.footer}>
        <Link to={ROUTES.NOTIFICATIONS} className={styles.allLink} onClick={() => setOpen(false)}>
          Xem tất cả
        </Link>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void listQuery.refetch();
      }}
      overlayClassName={styles.overlay}
    >
      <Badge count={unreadCount} size="small" overflowCount={99} offset={[-2, 2]}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <BellOutlined />
        </button>
      </Badge>
    </Popover>
  );
}
