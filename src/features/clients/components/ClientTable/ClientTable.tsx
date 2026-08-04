import { Button, Popconfirm, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { buildClientDetailPath, PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { useDeleteClient } from '../../hooks/useClients';
import type { Client } from '../../schemas/client.schema';
import styles from './ClientTable.module.scss';

interface ClientTableProps {
  clients: Client[];
  loading: boolean;
  onEdit: (client: Client) => void;
}

export function ClientTable({ clients, loading, onEdit }: ClientTableProps) {
  const { mutate: deleteClient, isPending, variables: deletingId } = useDeleteClient();

  const columns: ColumnsType<Client> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'vi'),
      render: (name: string, client) => <Link to={buildClientDetailPath(client.id)}>{name}</Link>,
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      align: 'center',
      render: (_, client) => (
        <div className={styles.actions}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${client.name}`}
            onClick={() => onEdit(client)}
          />
          <Popconfirm
            title={`Delete "${client.name}"?`}
            description="Only unused clients can be removed."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteClient(client.id)}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${client.name}`}
              loading={isPending && deletingId === client.id}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && clients.length === 0}
      emptyTitle="No clients found"
      emptyDescription="Create a client to use on projects."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={clients}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} clients`,
        }}
      />
    </TableWrapper>
  );
}
