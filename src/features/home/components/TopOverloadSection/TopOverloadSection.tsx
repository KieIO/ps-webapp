import { Empty } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { OVERLOAD_CAPACITY_THRESHOLD } from '../../constants';
import type { OverloadRankingItem } from '../../utils/workloadOverview';
import styles from './TopOverloadSection.module.scss';

interface TopOverloadSectionProps {
  items: OverloadRankingItem[];
}

export function TopOverloadSection({ items }: TopOverloadSectionProps) {
  return (
    <CardWrapper
      title="Top 5 nhân viên overload"
      subtitle={`Capacity > ${OVERLOAD_CAPACITY_THRESHOLD}% hôm nay`}
      actions={
        <Link to={ROUTES.CAPACITY} className={styles.link}>
          Capacity
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty
          description="Không có nhân viên overload trong phạm vi này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <ol className={styles.list}>
          {items.map((item) => (
            <li key={`${item.rank}-${item.userId ?? item.name}`} className={styles.item}>
              <span className={styles.rank}>{item.rank}</span>
              <div className={styles.name}>
                <UserNameLink name={item.name} userId={item.userId} />
              </div>
              <span className={styles.percent}>{Math.round(item.capacityPercent)}%</span>
              <span className={styles.dept}>{item.departmentLabel}</span>
              <div className={styles.track} aria-hidden>
                <span
                  className={styles.fill}
                  style={{ width: `${Math.min(item.capacityPercent, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </CardWrapper>
  );
}
