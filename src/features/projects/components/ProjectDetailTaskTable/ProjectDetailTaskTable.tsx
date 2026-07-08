import { Button, Table, Tooltip } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { ClassificationLevelBadge } from '@/features/tasks/components/ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '@/features/tasks/components/TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskStaffNameCell } from '@/features/tasks/components/TaskStaffNameCell/TaskStaffNameCell';
import { MY_TASK_COLUMN_HEADERS } from '@/features/tasks/constants';
import { formatTaskCodeShort } from '@/features/tasks/utils/taskDetail';
import { isMyTaskDateAtRisk } from '@/features/tasks/utils/taskDeadline';
import { DateWithRiskIndicator } from '@/shared/ui/DateWithRiskIndicator/DateWithRiskIndicator';
import { PROJECT_TASKS_PAGE_SIZE, PROJECT_TASKS_PAGE_SIZE_OPTIONS } from '../../constants';
import { getMyTaskColumnSorter } from '@/features/tasks/utils/myTaskColumns';
import type { ClassificationLevel, MyTask } from '@/features/tasks/schemas/task.schema';
import styles from './ProjectDetailTaskTable.module.scss';

interface ProjectDetailTaskTableProps {
  tasks: MyTask[];
  loading: boolean;
  total: number;
  onView?: (task: MyTask) => void;
}

export function ProjectDetailTaskTable({
  tasks,
  loading,
  total,
  onView,
}: ProjectDetailTaskTableProps) {
  const columns: ColumnsType<MyTask> = [
    {
      title: 'Task Code',
      dataIndex: 'taskCode',
      key: 'taskCode',
      width: 200,
      ellipsis: true,
      sorter: (a, b) => a.taskCode.localeCompare(b.taskCode, 'vi'),
      render: (value: string) => {
        if (!value) {
          return <span className={styles.empty}>—</span>;
        }

        const displayCode = formatTaskCodeShort(value);
        return (
          <Tooltip title={displayCode}>
            <span className={styles.truncate}>{displayCode}</span>
          </Tooltip>
        );
      },
    },
    {
      title: MY_TASK_COLUMN_HEADERS.taskName,
      dataIndex: 'taskName',
      key: 'taskName',
      width: 180,
      ellipsis: true,
      sorter: getMyTaskColumnSorter('taskName'),
      render: (name: string) => {
        if (!name) {
          return <span className={styles.empty}>—</span>;
        }

        return (
          <Tooltip title={name}>
            <span className={styles.truncate}>{name}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      align: 'center',
      sorter: getMyTaskColumnSorter('level'),
      render: (level: ClassificationLevel) => <ClassificationLevelBadge level={level} />,
    },
    {
      title: 'Assignee',
      key: 'assignee',
      width: 200,
      sorter: getMyTaskColumnSorter('staffName'),
      render: (_, record) => <TaskStaffNameCell staff={record.staff} showAvatarForFirst />,
    },
    {
      title: MY_TASK_COLUMN_HEADERS.date,
      dataIndex: 'date',
      key: 'date',
      width: 110,
      sorter: getMyTaskColumnSorter('date'),
      render: (value: string, record) => (
        <DateWithRiskIndicator date={value} atRisk={isMyTaskDateAtRisk(record, 'date')} />
      ),
    },
    {
      title: MY_TASK_COLUMN_HEADERS.completion,
      dataIndex: 'completionPercent',
      key: 'completionPercent',
      width: 100,
      align: 'right',
      sorter: getMyTaskColumnSorter('completion'),
      render: (value?: number) =>
        value != null ? `${value}%` : <span className={styles.empty}>—</span>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 70,
      align: 'right',
      sorter: getMyTaskColumnSorter('quantity'),
    },
    {
      title: 'Status',
      dataIndex: 'staffConfirmation',
      key: 'staffConfirmation',
      width: 130,
      sorter: getMyTaskColumnSorter('confirmation'),
      render: (status: MyTask['staffConfirmation']) => <TaskConfirmationBadge status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          aria-label={`View task ${record.taskName}`}
          onClick={() => onView?.(record)}
        />
      ),
    },
  ];

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && tasks.length === 0}
      emptyTitle="No tasks yet"
      emptyDescription="Assign a new task to get started on this project."
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tasks}
        scroll={{ x: 1160 }}
        pagination={{
          pageSize: PROJECT_TASKS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...PROJECT_TASKS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) => `Showing ${range[0]}-${range[1]} / ${count} tasks`,
        }}
      />
    </TableWrapper>
  );
}
