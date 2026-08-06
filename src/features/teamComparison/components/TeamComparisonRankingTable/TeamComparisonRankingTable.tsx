import { useMemo } from 'react';
import { Button, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowUpRight } from 'lucide-react';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { DepartmentTag } from '@/features/productivity/components/DepartmentTag/DepartmentTag';
import type { ProductivityRankingRow } from '@/features/productivity/schemas/productivityDashboard.schema';
import { formatCapacityPercent } from '@/features/productivity/utils/formatCapacityPercent';
import type { MainMetricKey } from '../../utils/sortRanking';
import { mainMetricShortLabel } from '../../utils/sortRanking';
import styles from './TeamComparisonRankingTable.module.scss';

interface RankedRow extends ProductivityRankingRow {
  rank: number;
  displayName: string;
}

interface TeamComparisonRankingTableProps {
  rows: RankedRow[];
  mainMetric: MainMetricKey;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onOpenUser: (userId: string) => void;
  monthLabel: string;
}

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

function RankCell({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? styles.rankGold
      : rank === 2
        ? styles.rankSilver
        : rank === 3
          ? styles.rankBronze
          : '';
  return (
    <span className={`${styles.rankCell} ${tone}`} aria-label={`Hạng ${rank}`}>
      #{rank}
    </span>
  );
}

export function TeamComparisonRankingTable({
  rows,
  mainMetric,
  selectedUserId,
  onSelectUser,
  onOpenUser,
  monthLabel,
}: TeamComparisonRankingTableProps) {
  // Keep columns stable across row selection — highlight uses rowClassName/onRow only.
  const columns = useMemo<ColumnsType<RankedRow>>(
    () => [
      {
        title: 'Hạng',
        dataIndex: 'rank',
        key: 'rank',
        width: 64,
        fixed: 'left',
        render: (rank: number) => <RankCell rank={rank} />,
      },
      {
        title: 'Nhân viên',
        dataIndex: 'displayName',
        key: 'displayName',
        fixed: 'left',
        width: 160,
        render: (name: string) => <span className={styles.nameCell}>{name}</span>,
      },
      {
        title: 'Phòng',
        dataIndex: 'displayDepartment',
        key: 'displayDepartment',
        width: 100,
        render: (department: string) => <DepartmentTag department={department} />,
      },
      {
        title: 'Capacity',
        dataIndex: 'capacityPercent',
        key: 'capacityPercent',
        width: 100,
        render: (value: number | null) =>
          value == null ? (
            <span className={styles.muted}>—</span>
          ) : (
            <span className={value > 90 ? styles.bad : undefined}>
              {formatCapacityPercent(value)}
            </span>
          ),
      },
      {
        title: 'Output',
        key: 'output',
        width: 110,
        render: (_, row) => (
          <span>
            {formatNumber.format(row.outputValue)} {row.outputUnit}
          </span>
        ),
      },
      {
        title: 'Vs target',
        key: 'vsTarget',
        width: 100,
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
        width: 90,
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
        width: 90,
        render: (value: number | null, row) =>
          row.revisionReviewed === 0 ? (
            <span className={styles.muted}>—</span>
          ) : (
            <Tooltip title={`${row.revisionRevised}/${row.revisionReviewed} task có revision`}>
              <span
                className={
                  value != null && value >= 40
                    ? styles.bad
                    : value != null && value >= 25
                      ? styles.warn
                      : styles.good
                }
              >
                {value == null ? '—' : `${Math.round(value)}%`}
              </span>
            </Tooltip>
          ),
      },
      {
        title: 'Quality',
        dataIndex: 'qualityScore',
        key: 'qualityScore',
        width: 90,
        render: (value: number | null, row) =>
          value == null ? (
            <span className={styles.muted}>—</span>
          ) : (
            <Tooltip title={`Trung bình từ ${row.qualityReviewed} review`}>
              <span className={value >= 80 ? styles.good : value >= 70 ? styles.warn : styles.bad}>
                {formatNumber.format(value)}
              </span>
            </Tooltip>
          ),
      },
      {
        title: 'OT',
        dataIndex: 'overtimeHours',
        key: 'overtimeHours',
        width: 90,
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
      {
        title: '',
        key: 'detail',
        width: 44,
        fixed: 'right',
        align: 'center',
        render: (_, row) => (
          <Tooltip title={`Xem chi tiết — ${row.displayName}`}>
            <Button
              type="text"
              size="small"
              className={styles.detailButton}
              icon={<ArrowUpRight size={14} aria-hidden />}
              aria-label={`Xem chi tiết của ${row.displayName}`}
              onClick={(event) => {
                event.stopPropagation();
                onOpenUser(row.userId);
              }}
            />
          </Tooltip>
        ),
      },
    ],
    [onOpenUser],
  );

  return (
    <CardWrapper
      title={`Nhân sự theo ${mainMetricShortLabel(mainMetric)}`}
      subtitle={`Tháng ${monthLabel} · chọn dòng để so sánh trên radar`}
      className={styles.card}
    >
      <Table
        className={styles.table}
        rowKey="userId"
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10, showSizeChanger: false, hideOnSinglePage: true }}
        scroll={{ x: 'max-content' }}
        size="small"
        locale={{ emptyText: 'Chưa có dữ liệu nhân sự trong kỳ này' }}
        rowClassName={(record) =>
          record.userId === selectedUserId
            ? `${styles.rowClickable} ${styles.rowSelected}`
            : styles.rowClickable
        }
        onRow={(record) => ({
          onClick: () => onSelectUser(record.userId),
          onKeyDown: (event) => {
            if (event.key === 'Enter') onSelectUser(record.userId);
          },
          tabIndex: 0,
          'aria-label': `Chọn ${record.displayName} để so sánh trên biểu đồ`,
          'aria-selected': record.userId === selectedUserId,
        })}
      />
    </CardWrapper>
  );
}
