import { Button } from 'antd';
import { BellOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildUserDetailPath, DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { usePendingReactivations, useReactivateUser } from '../../hooks/useLeave';
import styles from './PendingReactivationBanner.module.scss';

export function PendingReactivationBanner() {
  const { can } = usePermission();
  const navigate = useNavigate();
  const canReactivate = can('REACTIVATE_USER');
  const { data = [] } = usePendingReactivations(canReactivate);
  const { mutate: reactivate, isPending, variables } = useReactivateUser();
  const [expanded, setExpanded] = useState(false);

  if (!canReactivate || data.length === 0) {
    return null;
  }

  const visibleItems = expanded ? data : data.slice(0, 2);
  const hiddenCount = data.length - visibleItems.length;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <div className={styles.iconWrap}>
        <BellOutlined />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <strong>
            {data.length} employee{data.length === 1 ? '' : 's'} ready to return
          </strong>
          <span className={styles.subtitle}>
            Leave ended — reactivate to restore task assignment access
          </span>
        </div>

        <ul className={styles.list}>
          {visibleItems.map((item) => (
            <li key={item.leaveId} className={styles.item}>
              <button
                type="button"
                className={styles.userLink}
                onClick={() => navigate(buildUserDetailPath(item.userId))}
              >
                {item.userName}
              </button>
              <span className={styles.dates}>
                ended {dayjs(item.endDate).format(DATE_FORMAT)}
              </span>
              <Button
                type="primary"
                size="small"
                className={styles.activateBtn}
                loading={isPending && variables === item.userId}
                onClick={() => reactivate(item.userId)}
              >
                Activate
              </Button>
            </li>
          ))}
        </ul>

        {hiddenCount > 0 ? (
          <button type="button" className={styles.viewAll} onClick={() => setExpanded(true)}>
            View {hiddenCount} more
            <RightOutlined />
          </button>
        ) : null}
      </div>
    </div>
  );
}
