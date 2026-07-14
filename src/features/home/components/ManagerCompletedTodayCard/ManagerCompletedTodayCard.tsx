import { Progress } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import homeStyles from '../../styles/homeSection.module.scss';
import type { ManagerCompletedTodaySummary } from '../../utils/managerHomeMetrics';
import styles from './ManagerCompletedTodayCard.module.scss';

interface ManagerCompletedTodayCardProps {
  summary: ManagerCompletedTodaySummary;
  todayLabel: string;
}

export function ManagerCompletedTodayCard({ summary, todayLabel }: ManagerCompletedTodayCardProps) {
  const { completedCount, assignedTodayCount, remainingCount, percent } = summary;

  return (
    <CardWrapper
      title="Task hoàn thành hôm nay"
      subtitle={`${todayLabel} · hoàn thành / active trong ngày`}
      actions={
        <Link to={ROUTES.PROJECT_TASKS} className={homeStyles.link}>
          Task list
        </Link>
      }
      className={styles.card}
    >
      <div className={styles.valueRow}>
        <span className={styles.value}>
          {completedCount}
          <span className={styles.slash}>/</span>
          {assignedTodayCount}
        </span>
        <span className={styles.percent}>{percent}%</span>
      </div>

      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        strokeColor="var(--color-success, #16a34a)"
        className={styles.progress}
      />

      <p className={styles.hint}>
        {assignedTodayCount === 0
          ? 'Chưa có task active hôm nay trong phạm vi của bạn.'
          : remainingCount > 0
            ? `Còn ${remainingCount} task chưa hoàn thành trong ngày.`
            : 'Đã hoàn thành toàn bộ task active hôm nay.'}
      </p>
    </CardWrapper>
  );
}
