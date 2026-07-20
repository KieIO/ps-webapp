import { Button, Popconfirm, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useDeleteDepartment } from '../../hooks/useDeleteDepartment';
import type { Department } from '../../schemas/department.schema';

interface DepartmentTableProps {
  departments: Department[];
  loading: boolean;
  onEdit: (department: Department) => void;
}

export function DepartmentTable({ departments, loading, onEdit }: DepartmentTableProps) {
  const { mutate: deleteDepartment, isPending, variables: deletingId } = useDeleteDepartment();

  const columns: ColumnsType<Department> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 140,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value: string) => value || '—',
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      align: 'center',
      render: (_, department) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${department.name}`}
            onClick={() => onEdit(department)}
          />
          <Popconfirm
            title={`Delete "${department.name}"?`}
            description="Only unused departments can be removed."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteDepartment(department.id)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${department.name}`}
              loading={isPending && deletingId === department.id}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && departments.length === 0}
      emptyTitle="No departments found"
      emptyDescription="Create a department to use on tasks and task groups."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={departments}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} departments`,
        }}
      />
    </TableWrapper>
  );
}
