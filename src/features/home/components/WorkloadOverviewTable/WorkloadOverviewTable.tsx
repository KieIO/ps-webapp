import { Avatar, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill, type StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { getInitials } from '@/shared/utils/person';
import {
  HOME_WORKLOAD_STATUS,
  HOME_WORKLOAD_STATUS_LABELS,
  type HomeWorkloadStatus,
} from '../../constants';
import type { WorkloadOverviewRow } from '../../utils/workloadOverview';
import styles from './WorkloadOverviewTable.module.scss';

interface WorkloadOverviewTableProps {
  rows: WorkloadOverviewRow[];
  personColumnLabel: string;
  loading?: boolean;
}

const STATUS_VARIANT: Record<HomeWorkloadStatus, StatusPillVariant> = {
  [HOME_WORKLOAD_STATUS.GOOD]: 'completed',
  [HOME_WORKLOAD_STATUS.NORMAL]: 'in-progress',
  [HOME_WORKLOAD_STATUS.OVERLOADED]: 'overdue',
};

const CAPACITY_VARIANT: Record<HomeWorkloadStatus, StatusPillVariant> = {
  [HOME_WORKLOAD_STATUS.GOOD]: 'completed',
  [HOME_WORKLOAD_STATUS.NORMAL]: 'pending',
  [HOME_WORKLOAD_STATUS.OVERLOADED]: 'overdue',
};

const subtitleForColumn = (personColumnLabel: string): string => {
  if (personColumnLabel === 'CM') {
    return 'Capacity hôm nay · nhóm theo Creative Manager (CM)';
  }
  return 'Capacity hôm nay · nhóm theo Project Manager (PM)';
};

export function WorkloadOverviewTable({
  rows,
  personColumnLabel,
  loading = false,
}: WorkloadOverviewTableProps) {
  const columns: ColumnsType<WorkloadOverviewRow> = [
    {
      title: personColumnLabel,
      dataIndex: 'name',
      key: 'name',
      render: (_value, record) => (
        <div className={styles.person}>
          <Avatar size={28} className={styles.avatar}>
            {getInitials(record.name)}
          </Avatar>
          <div className={styles.personBody}>
            <UserNameLink name={record.name} userId={record.userId} />
            {record.departmentLabel && (
              <span className={styles.dept}>{record.departmentLabel}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Projects',
      dataIndex: 'projectCount',
      key: 'projectCount',
      width: 100,
      align: 'right',
    },
    {
      title: 'Tasks hôm nay',
      dataIndex: 'runningTaskCount',
      key: 'runningTaskCount',
      width: 120,
      align: 'right',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacityPercent',
      key: 'capacityPercent',
      width: 160,
      render: (value: number | null, record) =>
        value == null ? (
          <span className={styles.empty}>—</span>
        ) : (
          <CompletionProgressCell
            percent={Math.round(value)}
            variant={CAPACITY_VARIANT[record.status]}
          />
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: HomeWorkloadStatus) => (
        <StatusPill label={HOME_WORKLOAD_STATUS_LABELS[status]} variant={STATUS_VARIANT[status]} />
      ),
    },
  ];

  return (
    <CardWrapper
      title="Workload overview"
      subtitle={subtitleForColumn(personColumnLabel)}
      actions={
        <Link to={ROUTES.CAPACITY} className={styles.detailLink}>
          Xem chi tiết
        </Link>
      }
      className={styles.card}
    >
      <Table
        rowKey="key"
        className={styles.table}
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: 'Chưa có dữ liệu workload trong phạm vi này' }}
      />
    </CardWrapper>
  );
}
