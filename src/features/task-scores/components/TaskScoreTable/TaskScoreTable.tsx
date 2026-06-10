import { Button, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PAGINATION } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import type { TaskScoreGroupRecord } from '../../schemas/taskScoreGroup.schema';
import type { TaskScore } from '../../schemas/taskScore.schema';
import { TaskScoreGroupPill } from '../TaskScoreGroupPill/TaskScoreGroupPill';

interface TaskScoreTableProps {
  items: TaskScore[];
  groupByCode: Record<string, TaskScoreGroupRecord>;
  loading: boolean;
  onEdit: (item: TaskScore) => void;
}

export function TaskScoreTable({ items, groupByCode, loading, onEdit }: TaskScoreTableProps) {
  const columns: ColumnsType<TaskScore> = [
    {
      title: 'Task',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      width: 120,
      align: 'right',
      render: (score: number) => score.toLocaleString('vi-VN'),
    },
    {
      title: 'Group',
      dataIndex: 'group',
      key: 'group',
      width: 180,
      render: (code: string) => {
        const group = groupByCode[code];
        return group ? (
          <TaskScoreGroupPill label={group.label} colorKey={group.colorKey} />
        ) : (
          code
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button type="link" onClick={() => onEdit(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && items.length === 0}
      emptyTitle="No tasks found"
      emptyDescription="Try adjusting your search or filters, or create a new task."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        pagination={{
          defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
          showSizeChanger: {
            getPopupContainer: () => document.body,
          },
          pageSizeOptions: [...PAGINATION.PAGE_SIZE_OPTIONS],
          showTotal: (total) => `${total} tasks`,
        }}
      />
    </TableWrapper>
  );
}
