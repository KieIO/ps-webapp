import { Alert, Button, DatePicker, Empty, Skeleton, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import { CircleHelp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { OT_STATUS_LABELS } from '../../constants';
import { useOvertimeDashboard } from '../../hooks/useOvertime';
import type {
  OvertimeDashboardAlert,
  OvertimeDashboardPerson,
  OvertimeDashboardProject,
} from '../../schemas/overtime.schema';
import styles from './OvertimeDashboardTab.module.scss';

const thresholdAlertsHelp = (
  <div className={styles.tooltipContent}>
    <p className={styles.tooltipLead}>
      Liệt kê nhân sự có tổng OT ước tính trong 1 tuần vượt ngưỡng (mặc định 20h/tuần, chỉnh ở
      Settings).
    </p>
    <p className={styles.tooltipLead}>Cách tính:</p>
    <ul className={styles.tooltipList}>
      <li>Lấy OT request trong tháng đang lọc.</li>
      <li>
        Chỉ tính trạng thái {OT_STATUS_LABELS.approved}, {OT_STATUS_LABELS.in_progress},{' '}
        {OT_STATUS_LABELS.awaiting_review}, {OT_STATUS_LABELS.completed}. Không tính{' '}
        {OT_STATUS_LABELS.pending} và {OT_STATUS_LABELS.rejected}.
      </li>
      <li>Gom theo nhân sự và tuần (Thứ 2 đến Chủ nhật), cộng giờ ước tính.</li>
      <li>Tuần nào vượt ngưỡng thì hiện một dòng.</li>
    </ul>
    <p className={styles.tooltipNote}>
      Chỉ mang tính cảnh báo trên dashboard, không chặn tạo hoặc duyệt OT.
    </p>
  </div>
);
function exportByPersonCsv(year: number, month: number, rows: OvertimeDashboardPerson[]) {
  const header = ['Assignee', 'Estimated hours', 'Actual hours', 'Request count'];
  const lines = rows.map((row) =>
    [
      row.assignee.name || row.assignee.code || row.assignee.userId,
      row.estimatedHours,
      row.actualHours,
      row.requestCount,
    ].join(','),
  );
  const blob = new Blob([[header.join(','), ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ot-by-person-${year}-${String(month).padStart(2, '0')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function OvertimeDashboardTab() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => dayjs().startOf('month'));
  const year = selectedMonth.year();
  const month = selectedMonth.month() + 1;
  const { data, isLoading, isError, refetch } = useOvertimeDashboard(year, month);

  const personColumns: ColumnsType<OvertimeDashboardPerson> = useMemo(
    () => [
      {
        title: 'Nhân sự',
        key: 'assignee',
        render: (_, row) => row.assignee.name || row.assignee.code || '—',
      },
      {
        title: 'Ước tính',
        dataIndex: 'estimatedHours',
        align: 'right',
        render: (v: number) => `${v}h`,
      },
      {
        title: 'Thực tế',
        dataIndex: 'actualHours',
        align: 'right',
        render: (v: number) => `${v}h`,
      },
      {
        title: 'Số request',
        dataIndex: 'requestCount',
        align: 'right',
      },
    ],
    [],
  );

  const projectColumns: ColumnsType<OvertimeDashboardProject> = useMemo(
    () => [
      {
        title: 'Dự án',
        key: 'project',
        render: (_, row) => row.project.name || row.project.code || '—',
      },
      {
        title: 'Ước tính',
        dataIndex: 'estimatedHours',
        align: 'right',
        render: (v: number) => `${v}h`,
      },
      {
        title: 'Thực tế',
        dataIndex: 'actualHours',
        align: 'right',
        render: (v: number) => `${v}h`,
      },
      {
        title: 'Số request',
        dataIndex: 'requestCount',
        align: 'right',
      },
    ],
    [],
  );

  const alertColumns: ColumnsType<OvertimeDashboardAlert> = useMemo(
    () => [
      {
        title: 'Nhân sự',
        key: 'assignee',
        render: (_, row) => row.assignee.name || row.assignee.code || '—',
      },
      {
        title: 'Tuần',
        key: 'week',
        render: (_, row) =>
          `${dayjs(row.weekStart).format(DATE_FORMAT)} – ${dayjs(row.weekEnd).format(DATE_FORMAT)}`,
      },
      {
        title: 'OT ước tính',
        dataIndex: 'estimatedHours',
        align: 'right',
        render: (v: number) => `${v}h`,
      },
      {
        title: 'Ngưỡng',
        dataIndex: 'threshold',
        align: 'right',
        render: (v: number) => `${v}h/tuần`,
      },
    ],
    [],
  );

  const totalEstimated = data?.byPerson.reduce((sum, row) => sum + row.estimatedHours, 0) ?? 0;
  const totalActual = data?.byPerson.reduce((sum, row) => sum + row.actualHours, 0) ?? 0;
  const totalRequests = data?.byPerson.reduce((sum, row) => sum + row.requestCount, 0) ?? 0;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <DatePicker
          picker="month"
          allowClear={false}
          value={selectedMonth}
          format="[Tháng] M/YYYY"
          onChange={(value) => {
            if (value) setSelectedMonth(value.startOf('month'));
          }}
        />
        <Button
          disabled={!data?.byPerson.length}
          onClick={() => {
            if (data) exportByPersonCsv(year, month, data.byPerson);
          }}
        >
          Xuất CSV (theo người)
        </Button>
      </div>

      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được dashboard OT"
          action={
            <Button size="small" onClick={() => void refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : data ? (
        <>
          <div className={styles.metrics}>
            <CardWrapper title="Tổng ước tính">
              <p className={styles.metricValue}>{totalEstimated}h</p>
            </CardWrapper>
            <CardWrapper title="Tổng thực tế">
              <p className={styles.metricValue}>{totalActual}h</p>
            </CardWrapper>
            <CardWrapper title="Số request">
              <p className={styles.metricValue}>{totalRequests}</p>
            </CardWrapper>
            <CardWrapper title="Ngưỡng cảnh báo">
              <p className={styles.metricValue}>{data.threshold}h/tuần</p>
            </CardWrapper>
          </div>

          <div className={styles.grid}>
            <CardWrapper title="Theo nhân sự">
              <Table
                rowKey={(row) => row.assignee.userId}
                columns={personColumns}
                dataSource={data.byPerson}
                pagination={false}
                size="small"
                locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
              />
            </CardWrapper>

            <CardWrapper title="Theo dự án">
              <Table
                rowKey={(row) => row.project.id}
                columns={projectColumns}
                dataSource={data.byProject}
                pagination={false}
                size="small"
                locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
              />
            </CardWrapper>
          </div>

          <CardWrapper
            title="Cảnh báo vượt ngưỡng"
            actions={
              <Tooltip title={thresholdAlertsHelp} placement="topLeft" mouseEnterDelay={0.15}>
                <button
                  type="button"
                  className={styles.helpButton}
                  aria-label="Giải thích cảnh báo vượt ngưỡng"
                >
                  <CircleHelp size={16} aria-hidden />
                </button>
              </Tooltip>
            }
          >
            <Table
              rowKey={(row) => `${row.assignee.userId}-${row.weekStart}`}
              columns={alertColumns}
              dataSource={data.alerts}
              pagination={false}
              size="small"
              locale={{ emptyText: <Empty description="Không có cảnh báo" /> }}
            />
          </CardWrapper>
        </>
      ) : null}
    </div>
  );
}
