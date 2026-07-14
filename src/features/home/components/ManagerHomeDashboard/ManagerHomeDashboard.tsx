import { Alert, Button, Skeleton } from 'antd';
import { ROLE_LABELS } from '@/config/permissions';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useManagerHomeData } from '../../hooks/useManagerHomeData';
import { ManagerActionTasksSection } from '../ManagerActionTasksSection/ManagerActionTasksSection';
import { ManagerCompletedTodayCard } from '../ManagerCompletedTodayCard/ManagerCompletedTodayCard';
import { ManagerRunningProjectsSection } from '../ManagerRunningProjectsSection/ManagerRunningProjectsSection';
import { ManagerTeamCapacitySection } from '../ManagerTeamCapacitySection/ManagerTeamCapacitySection';
import { SystemNotificationsSection } from '../SystemNotificationsSection/SystemNotificationsSection';
import styles from './ManagerHomeDashboard.module.scss';

export function ManagerHomeDashboard() {
  const { role, isLoading, isError, data, refetch } = useManagerHomeData();
  const roleLabel = role ? ROLE_LABELS[role] : 'Manager';

  return (
    <div className={styles.root}>
      <PageHeader
        title="Home"
        subtitle={`${roleLabel} · projects, task cần xử lý và capacity team`}
      />

      <PendingReactivationBanner />

      {isError && (
        <Alert
          type="error"
          showIcon
          className={styles.alert}
          message="Không tải được dữ liệu Home"
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {isLoading || !data ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : (
        <>
          <div className={styles.topRow}>
            <ManagerRunningProjectsSection items={data.runningProjects} />
            <ManagerActionTasksSection items={data.actionTasks} />
          </div>

          <div className={styles.midRow}>
            <ManagerTeamCapacitySection items={data.teamCapacity} />
            <ManagerCompletedTodayCard summary={data.completedToday} todayLabel={data.todayLabel} />
          </div>

          <SystemNotificationsSection />
        </>
      )}
    </div>
  );
}
