import { Button, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { usePermission } from '@/shared/hooks/usePermission';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { OvertimeStatusBadge } from '../OvertimeStatusBadge/OvertimeStatusBadge';
import {
  canEditOvertimeRequest,
  formatOtReasonCategories,
  OT_REASON_CATEGORY_LABELS,
  overtimeEditDisabledReason,
  type OtReasonCategory,
} from '../../constants';
import type { OvertimeRecord } from '../../schemas/overtime.schema';
import styles from './OvertimeTable.module.scss';

interface OvertimeTableProps {
  records: OvertimeRecord[];
  loading?: boolean;
  onRowClick?: (record: OvertimeRecord) => void;
  onEdit?: (record: OvertimeRecord) => void;
}

const VISIBLE_REASON_TAGS = 2;

function reasonLabel(key: string): string {
  return key in OT_REASON_CATEGORY_LABELS
    ? OT_REASON_CATEGORY_LABELS[key as OtReasonCategory]
    : key;
}

function OtReasonsCell({ record }: { record: OvertimeRecord }) {
  const categories = record.reasonCategories ?? [];
  if (categories.length === 0) {
    return <span className={styles.muted}>—</span>;
  }

  const visible = categories.slice(0, VISIBLE_REASON_TAGS);
  const hiddenCount = categories.length - visible.length;
  const tooltipTitle = (
    <div className={styles.reasonTooltip}>
      <p className={styles.reasonTooltipTitle}>{formatOtReasonCategories(categories)}</p>
      {record.reason ? <p className={styles.reasonTooltipDesc}>{record.reason}</p> : null}
    </div>
  );

  return (
    <Tooltip title={tooltipTitle} placement="topLeft">
      <div className={styles.reasons}>
        {visible.map((key) => (
          <Tag key={key} className={styles.reasonTag}>
            {reasonLabel(key)}
          </Tag>
        ))}
        {hiddenCount > 0 ? <Tag className={styles.reasonMore}>+{hiddenCount}</Tag> : null}
      </div>
    </Tooltip>
  );
}

export function OvertimeTable({ records, loading, onRowClick, onEdit }: OvertimeTableProps) {
  const { can } = usePermission();
  const canRequest = can('REQUEST_OT');

  const columns: ColumnsType<OvertimeRecord> = [
    {
      title: 'Ngày OT',
      dataIndex: 'otDate',
      key: 'otDate',
      width: 120,
      render: (value: string) => dayjs(value).format(DATE_FORMAT),
      sorter: (a, b) => dayjs(a.otDate).unix() - dayjs(b.otDate).unix(),
    },
    {
      title: 'Dự án',
      key: 'project',
      ellipsis: true,
      render: (_, record) => record.project.name || record.project.code || '—',
    },
    {
      title: 'Người OT',
      key: 'assignee',
      width: 160,
      render: (_, record) => record.assignee.name || record.assignee.code || '—',
    },
    {
      title: 'Lý do OT',
      key: 'reasonCategories',
      width: 220,
      render: (_, record) => <OtReasonsCell record={record} />,
    },
    {
      title: 'Khung giờ',
      key: 'time',
      width: 140,
      render: (_, record) => `${record.startTime} – ${record.endTime}`,
    },
    {
      title: 'Ước tính',
      dataIndex: 'estimatedHours',
      key: 'estimatedHours',
      width: 90,
      align: 'right',
      render: (value: number) => `${value}h`,
    },
    {
      title: 'Thực tế',
      dataIndex: 'actualHours',
      key: 'actualHours',
      width: 90,
      align: 'right',
      render: (value?: number | null) => (value != null ? `${value}h` : '—'),
    },
    {
      title: 'Người yêu cầu',
      key: 'requestedBy',
      width: 140,
      render: (_, record) => record.requestedBy.name || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: OvertimeRecord['status']) => <OvertimeStatusBadge status={status} />,
    },
  ];

  if (canRequest && onEdit) {
    columns.push({
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const editable = canEditOvertimeRequest(record.status);
        const disabledReason = overtimeEditDisabledReason(record.status);
        return (
          <Tooltip title={disabledReason ?? undefined}>
            <span
              className={styles.editTrigger}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <Button
                size="small"
                disabled={!editable}
                onClick={() => {
                  if (!editable) return;
                  onEdit(record);
                }}
              >
                Sửa
              </Button>
            </span>
          </Tooltip>
        );
      },
    });
  }

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && records.length === 0}
      emptyTitle="Chưa có OT request nào"
      emptyDescription="Tạo request mới hoặc điều chỉnh bộ lọc."
    >
      <Table
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={records}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        scroll={{ x: 1280 }}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          className: onRowClick ? styles.clickable : undefined,
        })}
      />
    </TableWrapper>
  );
}
