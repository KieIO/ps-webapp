import { Button, Popconfirm, Table } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useDeleteJobGroup } from '../../hooks/useDeleteJobGroup';
import type { JobGroup } from '../../schemas/title.schema';

interface JobGroupTableProps {
  groups: JobGroup[];
  loading: boolean;
}

export function JobGroupTable({ groups, loading }: JobGroupTableProps) {
  const { mutate: deleteGroup, isPending, variables: deletingId } = useDeleteJobGroup();

  const columns: ColumnsType<JobGroup> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 160,
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '',
      key: 'actions',
      width: 72,
      align: 'center',
      render: (_, group) => (
        <Popconfirm
          title={`Delete "${group.label}"?`}
          description="Only groups with no job titles can be removed."
          okText="Delete"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteGroup(group.id)}
        >
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Delete ${group.label}`}
            loading={isPending && deletingId === group.id}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && groups.length === 0}
      emptyTitle="No job groups found"
      emptyDescription="Create a job group to classify employee titles."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={groups}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} job groups`,
        }}
      />
    </TableWrapper>
  );
}
