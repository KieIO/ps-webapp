import { Button } from 'antd';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { NotificationFeed } from '@/features/notifications/components/NotificationFeed/NotificationFeed';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationList,
} from '@/features/notifications/hooks/useNotifications';
import styles from './NotificationsPage.module.scss';

export default function NotificationsPage() {
  const listQuery = useNotificationList(50);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = listQuery.data?.unreadCount ?? 0;
  const items = listQuery.data?.items ?? [];

  return (
    <div className={styles.root}>
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} chưa đọc · cập nhật realtime`
            : 'Hộp thư thông báo hệ thống'
        }
        actions={
          <Button
            onClick={() => markAll.mutate()}
            disabled={unreadCount === 0 || markAll.isPending}
            loading={markAll.isPending}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        }
      />

      <CardWrapper
        title="Inbox"
        subtitle={listQuery.data ? `${listQuery.data.total} thông báo` : undefined}
      >
        <NotificationFeed
          items={items}
          isLoading={listQuery.isLoading}
          onItemClick={(item) => {
            if (!item.isRead) markRead.mutate(item.id);
          }}
        />
      </CardWrapper>
    </div>
  );
}
