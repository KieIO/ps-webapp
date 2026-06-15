import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined } from '@ant-design/icons';
import { buildUserDetailPath, DATE_FORMAT, PAGINATION } from '@/config/constants';
import { LeaveScheduleModal } from '@/features/leave/components/LeaveScheduleModal/LeaveScheduleModal';
import { usePermission } from '@/shared/hooks/usePermission';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { StatusPill, type StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import { JobLevelBadge } from '@/features/capacity/components/JobLevelBadge/JobLevelBadge';
import { DepartmentBadge } from '../DepartmentBadge/DepartmentBadge';
import { UserStatusColumnTitle } from '../UserStatusHelpTooltip/UserStatusHelpTooltip';
import { ROLE_LABELS, STATUS_LABELS, USER_DEPARTMENTS } from '../../constants';
import type { User, UserStatus } from '../../schemas/user.schema';
import { USER_STATUSES } from '../../schemas/user.schema';
import { ROLE_ORDER } from '@/config/permissions';
import { compareJobLevelCodes, mapJobLevelCode } from '../../utils/jobLevel';

const compareText = (a: string, b: string) => a.localeCompare(b, 'vi');

const compareDate = (a: string, b: string) => dayjs(a).unix() - dayjs(b).unix();

const compareEnumIndex = <T extends string>(values: readonly T[], a: T, b: T) =>
  values.indexOf(a) - values.indexOf(b);

const compareUserJobLevel = (a: User, b: User) => compareJobLevelCodes(a.jobLevelCode, b.jobLevelCode);

const STATUS_VARIANT: Record<UserStatus, StatusPillVariant> = {
  active: 'completed',
  on_leave: 'on-leave',
  inactive: 'on-leave',
  invited: 'pending',
};

interface UserTableProps {
  users: User[];
  loading: boolean;
}

export function UserTable({ users, loading }: UserTableProps) {
  const navigate = useNavigate();
  const { can } = usePermission();
  const canManageLeave = can('MANAGE_LEAVE');
  const [leaveTarget, setLeaveTarget] = useState<User | null>(null);

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => compareText(a.name, b.name),
      render: (name: string, record) => (
        <Button type="link" onClick={() => navigate(buildUserDetailPath(record.id))}>
          {name}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => compareText(a.email, b.email),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => compareEnumIndex(USER_DEPARTMENTS, a.department, b.department),
      render: (department: User['department']) => <DepartmentBadge department={department} />,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => compareEnumIndex(ROLE_ORDER, a.role, b.role),
      render: (role: User['role']) => ROLE_LABELS[role],
    },
    {
      title: 'Level',
      key: 'level',
      sorter: compareUserJobLevel,
      render: (_: unknown, record: User) => {
        const level = mapJobLevelCode(record.jobLevelCode);
        return level ? <JobLevelBadge level={level} /> : '—';
      },
    },
    {
      title: 'Position code',
      key: 'positionCode',
      sorter: (a, b) => compareText(a.positionCode ?? '', b.positionCode ?? ''),
      render: (_: unknown, record: User) => record.positionCode ?? '—',
    },
    {
      title: 'Job title',
      key: 'jobTitle',
      sorter: (a, b) => compareText(a.jobTitleName ?? '', b.jobTitleName ?? ''),
      render: (_: unknown, record: User) => record.jobTitleName ?? '—',
    },
    {
      title: <UserStatusColumnTitle />,
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => compareEnumIndex(USER_STATUSES, a.status, b.status),
      render: (status: UserStatus) => (
        <StatusPill label={STATUS_LABELS[status]} variant={STATUS_VARIANT[status]} />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      sorter: (a, b) => compareDate(a.joinedAt, b.joinedAt),
      render: (joinedAt: string) => dayjs(joinedAt).format(DATE_FORMAT),
    },
    {
      title: '',
      key: 'actions',
      width: canManageLeave ? 180 : 80,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 4 }}>
          {canManageLeave && record.status !== 'on_leave' ? (
            <Button
              type="link"
              icon={<CalendarOutlined />}
              onClick={() => setLeaveTarget(record)}
            >
              Leave
            </Button>
          ) : null}
          <Button type="link" onClick={() => navigate(buildUserDetailPath(record.id))}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
    <TableWrapper
      loading={loading}
      isEmpty={!loading && users.length === 0}
      emptyTitle="No users found"
      emptyDescription="Try adjusting your search or filters."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        pagination={{
          pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} users`,
        }}
      />
    </TableWrapper>

    {leaveTarget ? (
      <LeaveScheduleModal
        open
        userId={leaveTarget.id}
        userName={leaveTarget.name}
        onClose={() => setLeaveTarget(null)}
      />
    ) : null}
  </>
  );
}
