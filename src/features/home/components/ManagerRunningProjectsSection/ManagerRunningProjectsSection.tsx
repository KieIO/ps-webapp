import dayjs from 'dayjs';
import { Empty, Progress } from 'antd';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { DATE_FORMAT, ROUTES, buildProjectDetailPath } from '@/config/constants';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { DEADLINE_RISK_DAYS } from '../../constants';
import homeStyles from '../../styles/homeSection.module.scss';
import type { ManagerRunningProjectItem } from '../../utils/managerHomeMetrics';
import styles from './ManagerRunningProjectsSection.module.scss';

interface ManagerRunningProjectsSectionProps {
  items: ManagerRunningProjectItem[];
}

const formatDaysUntilLabel = (daysUntil: number | null): string => {
  if (daysUntil == null) return 'Chưa có deadline';
  if (daysUntil < 0) return `Quá hạn ${Math.abs(daysUntil)} ngày`;
  if (daysUntil === 0) return 'Đến hạn hôm nay';
  return `Còn ${daysUntil} ngày`;
};

export function ManagerRunningProjectsSection({ items }: ManagerRunningProjectsSectionProps) {
  const atRiskCount = items.filter((item) => item.atRisk).length;

  return (
    <CardWrapper
      title="Projects đang chạy"
      subtitle={
        atRiskCount > 0
          ? `${items.length} dự án · ${atRiskCount} gần deadline (≤ ${DEADLINE_RISK_DAYS} ngày)`
          : `${items.length} dự án đang chạy`
      }
      actions={
        <Link to={ROUTES.PROJECT_TRACKER} className={homeStyles.link}>
          Project Tracker
        </Link>
      }
      className={styles.card}
    >
      {items.length === 0 ? (
        <Empty
          description="Không có project đang chạy trong phạm vi của bạn"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <ul className={classNames(homeStyles.stack, homeStyles.scrollBody)}>
          {items.map((item) => (
            <li
              key={item.id}
              className={classNames(homeStyles.item, item.atRisk && homeStyles.toneRisk)}
            >
              <div className={styles.top}>
                <div className={styles.titleBlock}>
                  <Link to={buildProjectDetailPath(item.id)} className={homeStyles.itemTitleLink}>
                    {item.name}
                  </Link>
                  <p className={styles.client}>{item.clientName}</p>
                </div>
                <ProjectUrgencyBadge urgency={item.urgency} />
              </div>

              <div className={homeStyles.metaStrong}>
                {item.endDate ? dayjs(item.endDate).format(DATE_FORMAT) : '—'}
                {' · '}
                {formatDaysUntilLabel(item.daysUntil)}
              </div>

              <div className={styles.progressRow}>
                <Progress
                  percent={item.completionPercent}
                  size="small"
                  showInfo
                  strokeColor={item.atRisk ? 'var(--color-error)' : 'var(--color-primary)'}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardWrapper>
  );
}
