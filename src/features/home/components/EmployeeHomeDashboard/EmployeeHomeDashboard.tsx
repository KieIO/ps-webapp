import { Alert, Button, Skeleton } from 'antd';
import { ROLE_LABELS } from '@/config/permissions';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useEmployeeHomeData } from '../../hooks/useEmployeeHomeData';
import { EmployeeEvaluationsSection } from '../EmployeeEvaluationsSection/EmployeeEvaluationsSection';
import { EmployeeProductivitySection } from '../EmployeeProductivitySection/EmployeeProductivitySection';
import { EmployeeTodayTasksSection } from '../EmployeeTodayTasksSection/EmployeeTodayTasksSection';
import { SystemNotificationsSection } from '../SystemNotificationsSection/SystemNotificationsSection';
import styles from './EmployeeHomeDashboard.module.scss';

export function EmployeeHomeDashboard() {
  const { role, isTasksLoading, isProductivityLoading, isError, data, productivity, refetch } =
    useEmployeeHomeData();
  const roleLabel = role ? ROLE_LABELS[role] : 'Employee';

  return (
    <div className={styles.root}>
      <PageHeader title="Home" subtitle={`${roleLabel} · task hôm nay, productivity và đánh giá`} />

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

      {isTasksLoading || !data ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <EmployeeTodayTasksSection
          items={data.todayTasks}
          todayLabel={data.todayLabel}
          todayWeekday={data.todayWeekday}
        />
      )}

      {isProductivityLoading ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      ) : (
        <EmployeeProductivitySection productivity={productivity} />
      )}

      {isTasksLoading || !data ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
      ) : (
        <EmployeeEvaluationsSection items={data.evaluations} total={data.evaluationTotal} />
      )}

      <SystemNotificationsSection />
    </div>
  );
}
