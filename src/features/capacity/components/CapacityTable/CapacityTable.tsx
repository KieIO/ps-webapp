import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { DepartmentBadge } from '@/features/users/components/DepartmentBadge/DepartmentBadge';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import { WORK_STATUS_LABELS } from '../../constants';
import type { EmployeeCapacity } from '../../schemas/capacity.schema';
import { getCapacityProgressVariant } from '../../utils/capacityProgress';
import {
  compareAchievedTaskPoints,
  compareCapacityPercent,
  compareDepartment,
  compareEmployeeName,
  compareJobLevel,
  compareJobTitleName,
  comparePositionCode,
  compareSpecialistTaskPoints,
  compareWorkStatus,
} from '../../utils/capacityTableSort';
import {
  CapacityColumnTitle,
  SpecialistTaskPointsColumnTitle,
} from '../CapacityHelpTooltip/CapacityHelpTooltip';
import { JobLevelBadge } from '../JobLevelBadge/JobLevelBadge';
import styles from './CapacityTable.module.scss';

interface CapacityTableProps {
  items: EmployeeCapacity[];
  loading: boolean;
  periodLabel: string;
  isPeriodView?: boolean;
  workStatusTitle: string;
}

const formatPoints = (value: number) => value.toLocaleString('vi-VN');

export function CapacityTable({
  items,
  loading,
  periodLabel,
  isPeriodView = false,
  workStatusTitle,
}: CapacityTableProps) {
  const columns: ColumnsType<EmployeeCapacity> = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      sorter: compareEmployeeName,
      sortDirections: ['ascend', 'descend'],
      render: (name: string, record) => <UserNameLink name={name} userId={record.id} />,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: compareDepartment,
      sortDirections: ['ascend', 'descend'],
      render: (department: EmployeeCapacity['department']) => (
        <DepartmentBadge department={department} />
      ),
    },
    {
      title: 'Job level',
      dataIndex: 'jobLevel',
      key: 'jobLevel',
      sorter: compareJobLevel,
      sortDirections: ['ascend', 'descend'],
      render: (jobLevel: EmployeeCapacity['jobLevel']) => <JobLevelBadge level={jobLevel} />,
    },
    {
      title: 'Position code',
      dataIndex: 'positionCode',
      key: 'positionCode',
      sorter: comparePositionCode,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Job title',
      dataIndex: 'jobTitleName',
      key: 'jobTitleName',
      sorter: compareJobTitleName,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: <SpecialistTaskPointsColumnTitle />,
      dataIndex: 'specialistTaskPoints',
      key: 'specialistTaskPoints',
      width: 130,
      align: 'right',
      sorter: compareSpecialistTaskPoints,
      sortDirections: ['ascend', 'descend'],
      render: (specialistTaskPoints: EmployeeCapacity['specialistTaskPoints']) =>
        formatPoints(specialistTaskPoints),
    },
    {
      title: 'Điểm task đã đạt',
      dataIndex: 'achievedTaskPoints',
      key: 'achievedTaskPoints',
      width: 150,
      align: 'right',
      sorter: compareAchievedTaskPoints,
      sortDirections: ['ascend', 'descend'],
      render: (achievedTaskPoints: EmployeeCapacity['achievedTaskPoints']) =>
        formatPoints(achievedTaskPoints),
    },
    {
      title: workStatusTitle,
      dataIndex: 'workStatus',
      key: 'workStatus',
      width: 120,
      sorter: compareWorkStatus,
      sortDirections: ['ascend', 'descend'],
      render: (workStatus: EmployeeCapacity['workStatus']) => (
        <StatusPill
          label={WORK_STATUS_LABELS[workStatus]}
          variant={workStatus === 'working' ? 'completed' : 'on-leave'}
        />
      ),
    },
    {
      title: <CapacityColumnTitle periodLabel={periodLabel} isPeriodView={isPeriodView} />,
      dataIndex: 'capacityPercent',
      key: 'capacityPercent',
      width: 180,
      sorter: compareCapacityPercent,
      sortDirections: ['ascend', 'descend'],
      render: (capacityPercent: number | null, record) => {
        if (record.workStatus === 'off' || capacityPercent === null) {
          return <span className={styles.emptyCapacity}>—</span>;
        }

        return (
          <CompletionProgressCell
            percent={capacityPercent}
            variant={getCapacityProgressVariant(capacityPercent)}
          />
        );
      },
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && items.length === 0}
      emptyTitle="No employees found"
      emptyDescription="Try adjusting the filters."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} employees`,
        }}
      />
    </TableWrapper>
  );
}
