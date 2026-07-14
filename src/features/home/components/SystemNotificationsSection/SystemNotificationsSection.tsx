import { AlertOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Empty, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { HOME_PLACEHOLDER_COMING_SOON, HOME_PLACEHOLDER_FORMULA_NOTE } from '../../constants';
import styles from './SystemNotificationsSection.module.scss';

type PlaceholderNotifType = 'ot' | 'overdue' | 'info';

/**
 * TODO(home-system-notifications): Replace placeholder feed with real notification
 * pipeline / formula when provided.
 */
const PLACEHOLDER_ITEMS: Array<{
  id: string;
  type: PlaceholderNotifType;
  message: string;
  time: string;
}> = [
  {
    id: 'n1',
    type: 'ot',
    message: 'PM Nguyễn Long đã gửi OT Request — 4h cho Pokeslide App',
    time: '5 phút trước',
  },
  {
    id: 'n2',
    type: 'overdue',
    message: 'Task SCR-011 quá hạn chưa hoàn thành — giao cho Trần Minh',
    time: '22 phút trước',
  },
  {
    id: 'n3',
    type: 'info',
    message: 'Nhân viên Phạm Đức chưa confirm task SCR-018 sau 20 phút',
    time: '41 phút trước',
  },
  {
    id: 'n4',
    type: 'overdue',
    message: '2 task trong dự án CRM Redesign sắp vượt deadline hôm nay',
    time: '1 giờ trước',
  },
];

const TYPE_ICON: Record<PlaceholderNotifType, typeof ClockCircleOutlined> = {
  ot: ClockCircleOutlined,
  overdue: AlertOutlined,
  info: InfoCircleOutlined,
};

export function SystemNotificationsSection() {
  return (
    <CardWrapper
      title="Thông báo hệ thống"
      subtitle={HOME_PLACEHOLDER_FORMULA_NOTE}
      actions={
        <div className={styles.actions}>
          <Tag color="gold">{HOME_PLACEHOLDER_COMING_SOON}</Tag>
          <Link to={ROUTES.NOTIFICATIONS} className={styles.link}>
            Xem tất cả
          </Link>
        </div>
      }
      className={styles.card}
    >
      <div data-todo="home-system-notifications">
        {PLACEHOLDER_ITEMS.length === 0 ? (
          <Empty description="Chưa có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <ul className={styles.list}>
            {PLACEHOLDER_ITEMS.map((item) => {
              const Icon = TYPE_ICON[item.type];
              return (
                <li key={item.id} className={styles.item}>
                  <span className={styles.icon} data-type={item.type}>
                    <Icon />
                  </span>
                  <div className={styles.body}>
                    <p className={styles.message}>{item.message}</p>
                    <span className={styles.time}>{item.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CardWrapper>
  );
}
