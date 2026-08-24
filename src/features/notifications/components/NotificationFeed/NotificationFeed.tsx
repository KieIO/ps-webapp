import {
  AlertOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Empty, Spin } from 'antd';
import { Link } from 'react-router-dom';
import type { Notification } from '../../schemas/notification.schema';
import { formatNotificationRelativeTime } from '../../utils/formatRelativeTime';
import { getNotificationPath } from '../../utils/notificationLinks';
import styles from './NotificationFeed.module.scss';

type FeedTone = 'reminder' | 'deadline' | 'ot' | 'overload' | 'info';

const TYPE_TONE: Record<string, FeedTone> = {
  task_reminder: 'reminder',
  task_assigned: 'info',
  task_creative_handoff: 'info',
  project_assigned: 'info',
  deadline_warning: 'deadline',
  overload: 'overload',
  ot_pending: 'ot',
  ot_approved: 'ot',
  ot_rejected: 'ot',
  ot_task_assigned: 'ot',
  ot_awaiting_review: 'ot',
  ot_result_rejected: 'ot',
  ot_summary_ready: 'ot',
  system: 'info',
};

const TONE_ICON: Record<FeedTone, typeof ClockCircleOutlined> = {
  reminder: ThunderboltOutlined,
  deadline: AlertOutlined,
  ot: ClockCircleOutlined,
  overload: WarningOutlined,
  info: InfoCircleOutlined,
};

interface NotificationFeedProps {
  items: Notification[];
  isLoading?: boolean;
  emptyDescription?: string;
  dense?: boolean;
  onItemClick?: (item: Notification) => void;
}

export function NotificationFeed({
  items,
  isLoading,
  emptyDescription = 'Chưa có thông báo',
  dense,
  onItemClick,
}: NotificationFeedProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="small" />
      </div>
    );
  }

  if (items.length === 0) {
    return <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <ul className={classNames(styles.list, dense && styles.dense)}>
      {items.map((item) => {
        const tone = TYPE_TONE[item.type] ?? 'info';
        const Icon = TONE_ICON[tone];
        const path = getNotificationPath(item);
        const content = (
          <>
            <span className={styles.icon} data-tone={tone}>
              <Icon />
            </span>
            <div className={styles.body}>
              <p className={classNames(styles.title, !item.isRead && styles.unread)}>
                {item.title}
              </p>
              {item.body ? <p className={styles.message}>{item.body}</p> : null}
              <span className={styles.time}>{formatNotificationRelativeTime(item.createdAt)}</span>
            </div>
            {!item.isRead ? <span className={styles.dot} aria-hidden /> : null}
          </>
        );

        if (path) {
          return (
            <li key={item.id} className={styles.item}>
              <Link to={path} className={styles.row} onClick={() => onItemClick?.(item)}>
                {content}
              </Link>
            </li>
          );
        }

        return (
          <li key={item.id} className={styles.item}>
            <button type="button" className={styles.row} onClick={() => onItemClick?.(item)}>
              {content}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
