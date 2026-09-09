import { useState } from 'react';
import { Alert, Button, DatePicker, Skeleton } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import {
  OverallMetricGrid,
  type CapacityMixItem,
} from '@/features/home/components/OverallMetricGrid/OverallMetricGrid';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useProductivityDashboard } from '../../hooks/useProductivityDashboard';
import { useProductivityRanking } from '../../hooks/useProductivityRanking';
import type { ProductivityMixMetric } from '../../schemas/productivityDashboard.schema';
import { ProductivityChartsSection } from '../ProductivityChartsSection/ProductivityChartsSection';
import { ProductivityExtraMetrics } from '../ProductivityExtraMetrics/ProductivityExtraMetrics';
import { ProductivityRankingTable } from '../ProductivityRankingTable/ProductivityRankingTable';
import styles from './ProductivityDashboard.module.scss';

const formatCount = new Intl.NumberFormat('vi-VN');

function mixItem(
  label: string,
  metric: ProductivityMixMetric,
  explanation: string,
  hintWhenAvailable: (metric: ProductivityMixMetric) => string,
): CapacityMixItem {
  return {
    label,
    metric,
    explanation,
    hint:
      metric.available && metric.total > 0
        ? hintWhenAvailable(metric)
        : (metric.message ?? 'Chưa có dữ liệu'),
  };
}

export function ProductivityDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf('month'));
  const period = { year: selectedMonth.year(), month: selectedMonth.month() + 1 };
  const dashboardQuery = useProductivityDashboard(period);
  // Ranking is an independent endpoint — fetch in parallel with the dashboard.
  const rankingQuery = useProductivityRanking(period);
  const data = dashboardQuery.data;
  const reportTitle = `Báo cáo Năng suất — Tháng ${selectedMonth.format('M/YYYY')}`;

  return (
    <div className={styles.root}>
      <PageHeader
        breadcrumb={[{ label: 'Reports' }, { label: 'Báo cáo Năng suất' }]}
        title={reportTitle}
        subtitle="Chi tiết capacity, output và chất lượng theo phòng ban trong kỳ báo cáo"
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
          message="Không tải được báo cáo năng suất"
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
          <Skeleton active paragraph={{ rows: 2 }} />
          <div className={styles.loadingCharts}>
            <Skeleton active paragraph={{ rows: 6 }} />
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      ) : data ? (
        <>
          <div className={styles.metricsSection}>
            <OverallMetricGrid
              data={data}
              showCompanyCapacity={false}
              hideStatGrid
              projectMix={[
                mixItem(
                  '% Implement',
                  data.projectMix.implement,
                  'Tỷ lệ task phòng Project có group Implementation trên catalog task score. Công thức: số task Implementation ÷ tổng task Project trong tháng × 100. Task hủy không tính.',
                  (metric) =>
                    `${formatCount.format(metric.matched)}/${formatCount.format(metric.total)} task Implementation`,
                ),
                mixItem(
                  '% Rework',
                  data.projectMix.rework,
                  'Tỷ lệ task phòng Project được quality review và có ít nhất 1 revision trong tháng. Mỗi task lấy review mới nhất. Cùng logic với Revision rate, lọc theo phòng Project.',
                  (metric) =>
                    `${formatCount.format(metric.matched)}/${formatCount.format(metric.total)} task có revision`,
                ),
              ]}
              creativeMix={[
                mixItem(
                  '% Quality control',
                  data.creativeMix.qualityControl,
                  'Tỷ lệ task phòng Creative có group Quality control trên catalog task score. Công thức: số task Quality control ÷ tổng task Creative trong tháng × 100. Task hủy không tính.',
                  (metric) =>
                    `${formatCount.format(metric.matched)}/${formatCount.format(metric.total)} task Quality control`,
                ),
                mixItem(
                  '% Rework',
                  data.creativeMix.rework,
                  'Tỷ lệ task phòng Creative được quality review và có ít nhất 1 revision trong tháng. Mỗi task lấy review mới nhất. Cùng logic với Revision rate, lọc theo phòng Creative.',
                  (metric) =>
                    `${formatCount.format(metric.matched)}/${formatCount.format(metric.total)} task có revision`,
                ),
              ]}
            />
            <ProductivityExtraMetrics data={data} />
          </div>
          <ProductivityChartsSection data={data} />
          <ProductivityRankingTable
            rows={rankingQuery.data?.ranking ?? []}
            loading={rankingQuery.isLoading}
            error={rankingQuery.isError}
            onRetry={() => void rankingQuery.refetch()}
            period={period}
            showManagers
          />
        </>
      ) : null}
    </div>
  );
}
