import { Button, Table, Tooltip } from 'antd';
import { EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { buildMyTaskDetailPath, DATE_FORMAT, DATETIME_SHORT_FORMAT } from '@/config/constants';
import { canViewCreativeDeadline } from '@/features/tasks/utils/creativeVisibility';
import { ClassificationLevelBadge } from '@/features/tasks/components/ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '@/features/tasks/components/TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskStaffNameCell } from '@/features/tasks/components/TaskStaffNameCell/TaskStaffNameCell';
import { MY_TASK_COLUMN_HEADERS } from '@/features/tasks/constants';
import { formatTaskCodeShort, getTaskDeadline } from '@/features/tasks/utils/taskDetail';
import { isMyTaskDateAtRisk } from '@/features/tasks/utils/taskDeadline';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { DateWithRiskIndicator } from '@/shared/ui/DateWithRiskIndicator/DateWithRiskIndicator';
import { PROJECT_TASKS_PAGE_SIZE, PROJECT_TASKS_PAGE_SIZE_OPTIONS } from '../../constants';
import { getMyTaskColumnSorter } from '@/features/tasks/utils/myTaskColumns';
import type { ClassificationLevel, MyTask } from '@/features/tasks/schemas/task.schema';
import styles from './ProjectDetailTaskTable.module.scss';

const COMPLETION_COLUMN_HINT = 'Phần trăm hoàn thành do PM đánh giá khi review';
const COMPLETION_EMPTY_HINT = 'PM chưa nhập % hoàn thành cho task này.';
const CREATIVE_DEADLINE_HINT =
  'Deadline nội bộ của phòng Creative. Để trống nếu task không đi qua Creative.';

function ColumnTitleWithHint({
  label,
  hint,
  ariaLabel,
  stacked,
  lines,
}: {
  label: string;
  hint: string;
  ariaLabel: string;
  stacked?: boolean;
  lines?: string[];
}) {
  const stackedLines = lines ?? (stacked ? label.split(' ') : null);

  return (
    <span className={stackedLines ? styles.columnHeaderStacked : styles.columnHeader}>
      {stackedLines ? (
        <span className={styles.columnLabelStacked}>
          {stackedLines.map((line) => (
            <span key={line} className={styles.columnLine}>
              {line}
            </span>
          ))}
        </span>
      ) : (
        label
      )}
      <Tooltip title={hint} placement="topLeft">
        <InfoCircleOutlined className={styles.infoIcon} aria-label={ariaLabel} />
      </Tooltip>
    </span>
  );
}

interface ProjectDetailTaskTableProps {
  tasks: MyTask[];
  loading: boolean;
  total: number;
}

export function ProjectDetailTaskTable({ tasks, loading, total }: ProjectDetailTaskTableProps) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const canViewCreativeDeadlineColumn = canViewCreativeDeadline(
    currentUser?.role,
    currentUser?.department,
  );

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
      render: (name: string, record) => {
        if (!name) {
          return <span className={styles.empty}>—</span>;
        }

        return (
          <Link
            to={buildMyTaskDetailPath(record.id)}
            state={{ from: record.taskCategory }}
            className={styles.taskNameLink}
          >
            <Tooltip title={name}>
              <span className={styles.truncate}>{name}</span>
            </Tooltip>
          </Link>
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
      width: 145,
      sorter: getMyTaskColumnSorter('date'),
      render: (_: string, record) => (
        <DateWithRiskIndicator
          date={getTaskDeadline(record)}
          atRisk={isMyTaskDateAtRisk(record, 'date')}
          format={DATETIME_SHORT_FORMAT}
        />
      ),
    },
    ...(canViewCreativeDeadlineColumn
      ? [
          {
            title: (
              <ColumnTitleWithHint
                label={MY_TASK_COLUMN_HEADERS.creativeDeadline}
                hint={CREATIVE_DEADLINE_HINT}
                ariaLabel="Giải thích Deadline Creative"
                stacked
              />
            ),
            dataIndex: 'creativeDeadline',
            key: 'creativeDeadline',
            width: 128,
            showSorterTooltip: false,
            onHeaderCell: () => ({ className: styles.stackedHeaderCell }),
            sorter: (a: MyTask, b: MyTask) => {
              const aValue = a.creativeDeadline;
              const bValue = b.creativeDeadline;
              if (!aValue && !bValue) return 0;
              if (!aValue) return 1;
              if (!bValue) return -1;
              return dayjs(aValue).unix() - dayjs(bValue).unix();
            },
            render: (value?: string | null) =>
              value ? (
                dayjs(value).format(DATE_FORMAT)
              ) : (
                <span className={styles.empty}>Chưa có</span>
              ),
          },
        ]
      : []),
    {
      title: (
        <ColumnTitleWithHint
          label={MY_TASK_COLUMN_HEADERS.completion}
          hint={COMPLETION_COLUMN_HINT}
          ariaLabel="Giải thích % hoàn thành"
          lines={['%', 'Hoàn thành']}
        />
      ),
      dataIndex: 'completionPercent',
      key: 'completionPercent',
      width: 128,
      align: 'right' as const,
      showSorterTooltip: false,
      onHeaderCell: () => ({ className: styles.stackedHeaderCell }),
      sorter: getMyTaskColumnSorter('completion'),
      render: (value?: number) =>
        value != null ? (
          `${value}%`
        ) : (
          <Tooltip title={COMPLETION_EMPTY_HINT} placement="topRight">
            <span className={styles.emptyHint}>Chưa đánh giá</span>
          </Tooltip>
        ),
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
        <Tooltip title="Xem chi tiết task">
          <Link
            to={buildMyTaskDetailPath(record.id)}
            state={{ from: record.taskCategory }}
            aria-label={`View task ${record.taskName}`}
          >
            <Button type="text" icon={<EyeOutlined />} />
          </Link>
        </Tooltip>
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
        scroll={{ x: canViewCreativeDeadlineColumn ? 1320 : 1188 }}
        pagination={{
          defaultPageSize: PROJECT_TASKS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...PROJECT_TASKS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) => `Showing ${range[0]}-${range[1]} / ${count} tasks`,
        }}
      />
    </TableWrapper>
  );
}
