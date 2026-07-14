import { Empty } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { ROUTES } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { OVERLOAD_CAPACITY_THRESHOLD } from '../../constants';
import homeStyles from '../../styles/homeSection.module.scss';
import type { ManagerTeamCapacityItem } from '../../utils/managerHomeMetrics';
import styles from './ManagerTeamCapacitySection.module.scss';

interface ManagerTeamCapacitySectionProps {
  items: ManagerTeamCapacityItem[];
}

export function ManagerTeamCapacitySection({ items }: ManagerTeamCapacitySectionProps) {
  const overloadCount = items.filter((item) => item.overloaded).length;

  return (
    <CardWrapper
      title="Capacity team"
      subtitle={
        overloadCount > 0
          ? `${items.length} staff · ${overloadCount} overload (>${OVERLOAD_CAPACITY_THRESHOLD}%)`
          : `${items.length} staff trên projects của bạn`
      }
      actions={
        <Link to={ROUTES.CAPACITY} className={homeStyles.link}>
          Capacity
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty
          description="Chưa có capacity staff trong phạm vi projects của bạn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <ul className={classNames(homeStyles.stack, homeStyles.scrollBody)}>
          {items.map((item) => (
            <li
              key={item.id}
              className={classNames(
                homeStyles.item,
                styles.capacityItem,
                item.overloaded && homeStyles.toneRisk,
              )}
            >
              <div className={styles.row}>
                <div className={styles.name}>
                  <UserNameLink name={item.name} userId={item.id} />
                </div>
                <span
                  className={classNames(styles.percent, item.overloaded && styles.percentOverload)}
                >
                  {item.capacityPercent}%
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.dept}>{item.departmentLabel}</span>
                <div className={styles.track} aria-hidden>
                  <span
                    className={classNames(styles.fill, item.overloaded && styles.fillOverload)}
                    style={{ width: `${Math.min(Math.max(item.capacityPercent, 0), 100)}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardWrapper>
  );
}
