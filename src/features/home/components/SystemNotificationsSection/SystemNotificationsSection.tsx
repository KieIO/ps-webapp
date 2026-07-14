import { Empty } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { NotificationFeed } from '@/features/notifications/components/NotificationFeed/NotificationFeed';
import {
  useMarkNotificationRead,
  useNotificationList,
} from '@/features/notifications/hooks/useNotifications';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import homeStyles from '../../styles/homeSection.module.scss';
import styles from './SystemNotificationsSection.module.scss';

const HOME_FEED_LIMIT = 6;

export function SystemNotificationsSection() {
  const listQuery = useNotificationList(HOME_FEED_LIMIT);
  const markRead = useMarkNotificationRead();

  const items = listQuery.data?.items ?? [];
  const unreadCount = listQuery.data?.unreadCount ?? 0;

  return (
    <CardWrapper
      title="Thông báo hệ thống"
      subtitle={
        unreadCount > 0
          ? `${unreadCount} chưa đọc · cập nhật trong phạm vi của bạn`
          : 'Cập nhật từ hệ thống trong phạm vi của bạn'
      }
      actions={
        <Link to={ROUTES.NOTIFICATIONS} className={homeStyles.link}>
          Notifications
        </Link>
      }
      className={styles.card}
    >
      {listQuery.isError ? (
        <Empty description="Không tải được thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className={homeStyles.scrollBody}>
          <NotificationFeed
            items={items}
            isLoading={listQuery.isLoading}
            dense
            onItemClick={(item) => {
              if (!item.isRead) markRead.mutate(item.id);
            }}
          />
        </div>
      )}
    </CardWrapper>
  );
}
