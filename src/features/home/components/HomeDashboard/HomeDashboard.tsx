import { useState } from 'react';
import { Alert, Button, DatePicker, Skeleton } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { PendingReactivationBanner } from '@/features/leave/components/PendingReactivationBanner/PendingReactivationBanner';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useOverallDashboard } from '../../hooks/useOverallDashboard';
import { OverallMetricGrid } from '../OverallMetricGrid/OverallMetricGrid';
import { OverallTrendSection } from '../OverallTrendSection/OverallTrendSection';
import { SystemNotificationsSection } from '../SystemNotificationsSection/SystemNotificationsSection';
import styles from './HomeDashboard.module.scss';

export function HomeDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf('month'));
  const period = { year: selectedMonth.year(), month: selectedMonth.month() + 1 };
  const dashboardQuery = useOverallDashboard(period);
  const data = dashboardQuery.data;

  return (
    <div className={styles.root}>
      <PageHeader
        title="Overall Dashboard"
        subtitle="Tổng quan capacity, output và hiệu suất toàn công ty"
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

      <PendingReactivationBanner />

      {dashboardQuery.isError && (
        <Alert
          type="error"
          showIcon
          className={styles.alert}
          message="Không tải được Overall Dashboard"
          description="Dữ liệu hiện chưa thể đồng bộ. Vui lòng thử lại."
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
          <div className={styles.loadingCharts}>
            <Skeleton active paragraph={{ rows: 6 }} />
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      ) : data ? (
        <>
          <OverallMetricGrid data={data} />
          <OverallTrendSection data={data} />
          <SystemNotificationsSection />
        </>
      ) : null}
    </div>
  );
}
