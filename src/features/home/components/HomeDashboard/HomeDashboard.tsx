import { Alert, Button, Skeleton } from 'antd';
import { ROLE_LABELS } from '@/config/permissions';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { useHomeDashboardData } from '../../hooks/useHomeDashboardData';
import { HomeMetricGrid } from '../HomeMetricGrid/HomeMetricGrid';
import { OtRequestsSection } from '../OtRequestsSection/OtRequestsSection';
import { SystemNotificationsSection } from '../SystemNotificationsSection/SystemNotificationsSection';
import { TopOverloadSection } from '../TopOverloadSection/TopOverloadSection';
import { WorkloadOverviewTable } from '../WorkloadOverviewTable/WorkloadOverviewTable';
import styles from './HomeDashboard.module.scss';

export function HomeDashboard() {
  const { role, isLoading, isError, data, refetch } = useHomeDashboardData();

  const roleLabel = role ? ROLE_LABELS[role] : 'Manager';

  return (
    <div className={styles.root}>
      <PageHeader
        title="Home"
        subtitle={`${roleLabel} · tổng quan dự án, task và capacity trong phạm vi của bạn`}
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
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        <>
          <HomeMetricGrid
            runningProjectCount={data.runningProjectCount}
            runningProjectsPreview={data.runningProjectsPreview}
            deadlineRiskCount={data.deadlineRiskCount}
            deadlineRiskDays={data.deadlineRiskDays}
            deadlineRiskProjects={data.deadlineRiskProjects}
            todayTaskCount={data.todayTaskCount}
            todayLabel={data.todayLabel}
            scopedTaskTotal={data.scopedTaskTotal}
            tasksByType={data.tasksByType}
            departmentCapacityPercent={data.departmentCapacityPercent}
            companyCapacityPercent={data.companyCapacityPercent}
          />

          <div className={styles.midRow}>
            <div className={styles.midPrimary}>
              <WorkloadOverviewTable
                rows={data.workloadRows}
                personColumnLabel={data.workloadPersonColumnLabel}
              />
            </div>
            <div className={styles.midSecondary}>
              <OtRequestsSection />
            </div>
          </div>

          <div className={styles.bottomRow}>
            <TopOverloadSection items={data.topOverload} />
            <SystemNotificationsSection />
          </div>
        </>
      )}
    </div>
  );
}
