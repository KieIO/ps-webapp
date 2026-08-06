import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { OvertimeStatusBadge } from '../OvertimeStatusBadge/OvertimeStatusBadge';
import type { OvertimeRecord } from '../../schemas/overtime.schema';
import styles from './OvertimeTable.module.scss';

interface OvertimeTableProps {
  records: OvertimeRecord[];
  loading?: boolean;
  onRowClick?: (record: OvertimeRecord) => void;
}

export function OvertimeTable({ records, loading, onRowClick }: OvertimeTableProps) {
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
        scroll={{ x: 960 }}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          className: onRowClick ? styles.clickable : undefined,
        })}
      />
    </TableWrapper>
  );
}
