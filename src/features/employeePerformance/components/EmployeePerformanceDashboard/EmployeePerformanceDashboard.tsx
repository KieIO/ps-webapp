import { useMemo, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, DatePicker, Skeleton, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { useEmployeePerformanceDetail } from '../../hooks/useEmployeePerformanceDetail';
import { exportEmployeePerformanceToCsv } from '../../utils/exportEmployeePerformance';
import { EmployeeDetailsSection } from '../EmployeeDetailsSection/EmployeeDetailsSection';
import { EmployeeMetricGrid } from '../EmployeeMetricGrid/EmployeeMetricGrid';
import { EmployeeProfileCard } from '../EmployeeProfileCard/EmployeeProfileCard';
import { EmployeeTrendSection } from '../EmployeeTrendSection/EmployeeTrendSection';
import styles from './EmployeePerformanceDashboard.module.scss';

interface EmployeePerformanceDashboardProps {
  userId: string;
}

const initialMonth = (params: URLSearchParams): Dayjs => {
  const year = Number(params.get('year'));
  const month = Number(params.get('month'));
  if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12) {
    return dayjs(new Date(year, month - 1, 1)).startOf('month');
  }
  return dayjs().startOf('month');
};

export function EmployeePerformanceDashboard({ userId }: EmployeePerformanceDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exporting, setExporting] = useState(false);
  const selectedMonth = useMemo(() => initialMonth(searchParams), [searchParams]);
  const period = { year: selectedMonth.year(), month: selectedMonth.month() + 1 };
  const detailQuery = useEmployeePerformanceDetail(userId, period);
  const data = detailQuery.data;

  const handleMonthChange = (value: Dayjs | null) => {
    if (!value) return;
    const next = new URLSearchParams(searchParams);
    next.set('year', String(value.year()));
    next.set('month', String(value.month() + 1));
    setSearchParams(next);
  };

  const handleExport = () => {
    if (!data) return;
    if (data.recentTasks.length === 0) {
      message.warning('Không có task gần đây để xuất.');
      return;
    }

    setExporting(true);
    try {
      exportEmployeePerformanceToCsv(data);
      message.success('Đã tải file xuất.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.root}>
      <PageHeader
        breadcrumb={[
          { label: 'Reports' },
          { label: 'So sánh nhóm', path: ROUTES.TEAM_COMPARISON },
          { label: data?.profile.name ?? 'Chi tiết nhân viên' },
        ]}
        title={data ? `Hiệu suất cá nhân — ${data.profile.name}` : 'Hiệu suất cá nhân'}
        subtitle="Tổng quan năng suất, chất lượng và xu hướng làm việc theo tháng"
        actions={
          <>
            <DatePicker
              picker="month"
              allowClear={false}
              value={selectedMonth}
              format="[Tháng] M/YYYY"
              onChange={handleMonthChange}
              aria-label="Chọn tháng báo cáo"
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              disabled={!data || detailQuery.isLoading}
            >
              Xuất Excel
            </Button>
          </>
        }
      />

      {detailQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được báo cáo hiệu suất nhân viên"
          description="Dữ liệu hiện chưa thể đồng bộ hoặc nhân viên không còn trong phạm vi báo cáo."
          action={
            <Button size="small" onClick={() => void detailQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {detailQuery.isLoading ? (
        <div className={styles.loading}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
          <div className={styles.loadingGrid}>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} active paragraph={{ rows: 2 }} />
            ))}
          </div>
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      ) : data ? (
        <>
          <EmployeeProfileCard profile={data.profile} />
          <EmployeeMetricGrid data={data} />
          <EmployeeTrendSection data={data} />
          <EmployeeDetailsSection tasks={data.recentTasks} comments={data.comments} />
        </>
      ) : null}
    </div>
  );
}
