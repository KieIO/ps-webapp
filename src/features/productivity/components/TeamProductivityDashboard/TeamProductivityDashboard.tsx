import { useState } from 'react';
import { Alert, Button, DatePicker, Skeleton } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { ROLES, type Role } from '@/config/permissions';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useTeamProductivityDashboard } from '../../hooks/useTeamProductivityDashboard';
import { ProductivityRankingTable } from '../ProductivityRankingTable/ProductivityRankingTable';
import { TeamAlertsSection } from '../TeamAlertsSection/TeamAlertsSection';
import { TeamMetricGrid } from '../TeamMetricGrid/TeamMetricGrid';
import styles from '../ProductivityDashboard/ProductivityDashboard.module.scss';

interface TeamProductivityDashboardProps {
  role: Role;
}

const groupLabelForRole = (role: Role): string =>
  role === ROLES.CREATIVE_MANAGER ? 'nhóm CM' : 'nhóm PM';

export function TeamProductivityDashboard({ role }: TeamProductivityDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf('month'));
  const period = { year: selectedMonth.year(), month: selectedMonth.month() + 1 };
  const dashboardQuery = useTeamProductivityDashboard(period);
  const data = dashboardQuery.data;
  const groupLabel = groupLabelForRole(role);

  return (
    <div className={styles.root}>
      <PageHeader
        breadcrumb={[{ label: 'Reports' }, { label: 'Năng suất nhóm' }]}
        title="Năng suất nhóm"
        subtitle={`Capacity, tiến độ và chất lượng của ${groupLabel} trong tháng`}
        actions={
          <DatePicker
            picker="month"
            allowClear={false}
            value={selectedMonth}
            format="[Tháng] M/YYYY"
            onChange={(value) => {
              if (value) setSelectedMonth(value.startOf('month'));
            }}
            aria-label="Chọn tháng báo cáo"
          />
        }
      />

      {dashboardQuery.isError && (
        <Alert
          type="error"
          showIcon
          className={styles.alert}
          message="Không tải được dữ liệu"
          description="Thử lại nhé."
          action={
            <Button size="small" onClick={() => void dashboardQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      )}

      {dashboardQuery.isLoading ? (
        <div className={styles.loading}>
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : data ? (
        <>
          <TeamMetricGrid data={data} groupLabel={groupLabel} role={role} />
          <ProductivityRankingTable
            rows={data.ranking}
            period={period}
            teamSummary={{
              avgCapacity: data.capacityPercent,
              overloadedCount: data.overloadedCount,
            }}
          />
          <TeamAlertsSection alerts={data.alerts} />
        </>
      ) : null}
    </div>
  );
}
