import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { buildUserDetailPath, DATE_FORMAT, PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { StatusPill, type StatusPillVariant } from '@/shared/ui/StatusPill/StatusPill';
import {
  DEPARTMENT_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
} from '../../constants';
import type { User, UserStatus } from '../../schemas/user.schema';

const STATUS_VARIANT: Record<UserStatus, StatusPillVariant> = {
  active: 'completed',
  inactive: 'on-leave',
  invited: 'pending',
};

interface UserTableProps {
  users: User[];
  loading: boolean;
}

export function UserTable({ users, loading }: UserTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => ROLE_LABELS[role],
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department: User['department']) => DEPARTMENT_LABELS[department],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <StatusPill label={STATUS_LABELS[status]} variant={STATUS_VARIANT[status]} />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (joinedAt: string) => dayjs(joinedAt).format(DATE_FORMAT),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(buildUserDetailPath(record.id))}>
          View
        </Button>
      ),
    },
  ];

  return (
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
  );
}
