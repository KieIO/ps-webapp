import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import type { JobLevel } from '../../schemas/title.schema';

interface JobLevelTableProps {
  levels: JobLevel[];
  loading: boolean;
}

export function JobLevelTable({ levels, loading }: JobLevelTableProps) {
  const columns: ColumnsType<JobLevel> = [
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
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && levels.length === 0}
      emptyTitle="No job levels found"
      emptyDescription="Create a job level to classify employee titles."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={levels}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} job levels`,
        }}
      />
    </TableWrapper>
  );
}
