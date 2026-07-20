import { useMemo, useState } from 'react';
import { Alert, Button, Select, Skeleton, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import type { ProductivityRankingRow } from '../../schemas/productivityDashboard.schema';
import { formatCapacityPercent } from '../../utils/formatCapacityPercent';
import { DepartmentTag } from '../DepartmentTag/DepartmentTag';
import styles from './ProductivityRankingTable.module.scss';

type DepartmentFilter = 'all' | 'Project' | 'Creative';

interface ProductivityRankingTableProps {
  rows: ProductivityRankingRow[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  /** Team report: show avg capacity / overload in subtitle and flag overload rows. */
  teamSummary?: {
    avgCapacity: number | null;
    overloadedCount: number;
    overloadThreshold?: number;
  };
}

const DEFAULT_OVERLOAD_THRESHOLD = 90;

const formatNumber = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

function TrendCell({
  trend,
  delta,
}: {
  trend: ProductivityRankingRow['trend'];
  delta: number | null;
}) {
  const symbol = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '=';
  const tone =
    trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : styles.trendFlat;
  const label =
    delta == null
      ? 'Chưa đủ dữ liệu tháng trước'
      : `Capacity ${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% so với tháng trước`;

  return (
    <Tooltip title={label}>
      <span className={`${styles.trend} ${tone}`} aria-label={label}>
        {symbol}
      </span>
    </Tooltip>
  );
}

export function ProductivityRankingTable({
  rows,
  loading = false,
  error = false,
  onRetry,
  teamSummary,
}: ProductivityRankingTableProps) {
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('all');
  const overloadThreshold = teamSummary?.overloadThreshold ?? DEFAULT_OVERLOAD_THRESHOLD;

  const filteredRows = useMemo(() => {
    if (departmentFilter === 'all') return rows;
    return rows.filter((row) => row.displayDepartment === departmentFilter);
  }, [departmentFilter, rows]);

  const subtitle = teamSummary
    ? [
        teamSummary.avgCapacity == null
          ? `${rows.length} nhân sự trong nhóm`
          : `TB nhóm ${formatCapacityPercent(teamSummary.avgCapacity)} · ${teamSummary.overloadedCount} người overload`,
        'Mặc định sort capacity giảm dần · trend so với tháng trước',
      ].join(' · ')
    : 'Sắp xếp mặc định theo capacity giảm dần · trend so với tháng trước';

  const columns = useMemo<ColumnsType<ProductivityRankingRow>>(
    () => [
      {
        title: 'Nhân viên',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 180,
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (name: string) => <span className={styles.nameCell}>{name}</span>,
      },
      {
        title: 'Phòng',
        dataIndex: 'displayDepartment',
        key: 'displayDepartment',
        width: 110,
        filters: [
          { text: 'Project', value: 'Project' },
          { text: 'Creative', value: 'Creative' },
        ],
        onFilter: (value, record) => record.displayDepartment === value,
        render: (department: string) => <DepartmentTag department={department} />,
      },
      {
        title: 'Capacity',
        dataIndex: 'capacityPercent',
        key: 'capacityPercent',
        width: teamSummary ? 130 : 100,
        defaultSortOrder: 'descend',
        sorter: (a, b) => (a.capacityPercent ?? -1) - (b.capacityPercent ?? -1),
        render: (value: number | null) => {
          if (value == null) return <span className={styles.muted}>—</span>;
          const overloaded = teamSummary != null && value > overloadThreshold;
          return (
            <span className={overloaded ? styles.capacityOverload : undefined}>
              {formatCapacityPercent(value)}
              {overloaded ? <span className={styles.overloadBadge}>Overload</span> : null}
            </span>
          );
        },
      },
      {
        title: 'Output',
        key: 'output',
        width: 120,
        sorter: (a, b) => a.outputValue - b.outputValue,
        render: (_, row) => (
          <span>
            {formatNumber.format(row.outputValue)} {row.outputUnit}
          </span>
        ),
      },
      {
        title: 'vs Target',
        key: 'vsTarget',
        width: 100,
        sorter: (a, b) => (a.vsTarget.percent ?? -1) - (b.vsTarget.percent ?? -1),
        render: (_, row) => {
          if (!row.vsTarget.available || row.vsTarget.percent == null) {
            return (
              <Tooltip title={row.vsTarget.message}>
                <span className={styles.muted}>{row.vsTarget.label}</span>
              </Tooltip>
            );
          }
          const value = row.vsTarget.percent;
          const tone = value >= 100 ? styles.good : value >= 80 ? styles.warn : styles.bad;
          return (
            <Tooltip title={row.vsTarget.message}>
              <span className={tone}>{row.vsTarget.label}</span>
            </Tooltip>
          );
        },
      },
      {
        title: 'On-time',
        dataIndex: 'onTimePercent',
        key: 'onTimePercent',
        width: 100,
        sorter: (a, b) => (a.onTimePercent ?? -1) - (b.onTimePercent ?? -1),
        render: (value: number | null, row) =>
          value == null ? (
            <span className={styles.muted}>—</span>
          ) : (
            <Tooltip title={`${row.onTimeOnTime}/${row.onTimeFinished} task đúng hạn`}>
              <span className={value >= 85 ? styles.good : value >= 80 ? styles.warn : styles.bad}>
                {Math.round(value)}%
              </span>
            </Tooltip>
          ),
      },
      {
        title: 'Revision',
        dataIndex: 'revisionPercent',
        key: 'revisionPercent',
        width: 100,
        sorter: (a, b) => (a.revisionPercent ?? -1) - (b.revisionPercent ?? -1),
        render: (value: number | null, row) =>
          row.revisionReviewed === 0 ? (
            <span className={styles.muted}>—</span>
          ) : (
            <Tooltip title={`${row.revisionRevised}/${row.revisionReviewed} task có revision`}>
              <span>{value == null ? '—' : `${Math.round(value)}%`}</span>
            </Tooltip>
          ),
      },
      {
        title: 'Quality',
        dataIndex: 'qualityScore',
        key: 'qualityScore',
        width: 100,
        sorter: (a, b) => (a.qualityScore ?? -1) - (b.qualityScore ?? -1),
        render: (value: number | null, row) =>
          value == null ? (
            <span className={styles.muted}>—</span>
          ) : (
            <Tooltip title={`Trung bình từ ${row.qualityReviewed} review`}>
              <span className={value >= 80 ? styles.good : value >= 70 ? styles.warn : styles.bad}>
                {formatNumber.format(value)}/100
              </span>
            </Tooltip>
          ),
      },
      {
        title: 'OT hours',
        dataIndex: 'overtimeHours',
        key: 'overtimeHours',
        width: 100,
        sorter: (a, b) => a.overtimeHours - b.overtimeHours,
        render: (value: number) =>
          value > 0 ? `${formatNumber.format(value)}h` : <span className={styles.muted}>—</span>,
      },
      {
        title: 'Trend',
        dataIndex: 'trend',
        key: 'trend',
        width: 72,
        align: 'center',
        render: (trend: ProductivityRankingRow['trend'], row) => (
          <TrendCell trend={trend} delta={row.capacityDelta} />
        ),
      },
    ],
    [overloadThreshold, teamSummary],
  );

  return (
    <CardWrapper
      title="Xếp hạng theo Capacity"
      subtitle={subtitle}
      className={styles.card}
      actions={
        <Select<DepartmentFilter>
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={[
            { value: 'all', label: 'Tất cả phòng ban' },
            { value: 'Project', label: 'Project' },
            { value: 'Creative', label: 'Creative' },
          ]}
          className={styles.filter}
          aria-label="Lọc phòng ban"
        />
      }
    >
      {error ? (
        <Alert
          type="error"
          showIcon
          message="Không tải được bảng xếp hạng"
          action={
            onRetry ? (
              <Button size="small" onClick={onRetry}>
                Thử lại
              </Button>
            ) : undefined
          }
        />
      ) : loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table
          className={styles.table}
          rowKey="userId"
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
          scroll={{ x: 1100 }}
          size="small"
          locale={{ emptyText: 'Chưa có dữ liệu nhân sự trong kỳ này' }}
        />
      )}
    </CardWrapper>
  );
}
