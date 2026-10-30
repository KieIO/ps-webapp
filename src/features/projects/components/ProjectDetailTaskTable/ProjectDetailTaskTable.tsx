import { Button, Space, Table, Tag, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { buildMyTaskDetailPath, DATE_FORMAT, DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { canViewCreativeDeadline } from '@/features/tasks/utils/creativeVisibility';
import { ClassificationLevelBadge } from '@/features/tasks/components/ClassificationLevelBadge/ClassificationLevelBadge';
import { CreativeEditDrawer } from '@/features/tasks/components/creativePipeline/CreativeEditDrawer';
import { EditHeadTaskModal } from '@/features/tasks/components/EditHeadTaskModal/EditHeadTaskModal';
import { EditTaskModal } from '@/features/tasks/components/EditTaskModal/EditTaskModal';
import { TaskConfirmationBadge } from '@/features/tasks/components/TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskStaffNameCell } from '@/features/tasks/components/TaskStaffNameCell/TaskStaffNameCell';
import { MY_TASK_COLUMN_HEADERS } from '@/features/tasks/constants';
import {
  canOpenCreativePipelineEdit,
  inferParentTaskCodeFromSplit,
  isSplitChildTask,
  isSplitParentTask,
  shouldUseCreativePipelineEditDrawer,
  SPLIT_CHILD_BADGE_HINT,
  SPLIT_CHILD_BADGE_LABEL,
  SPLIT_PARENT_BADGE_HINT,
  SPLIT_PARENT_BADGE_LABEL,
  WHOLE_ASSIGNED_BADGE_HINT,
  WHOLE_ASSIGNED_BADGE_LABEL,
} from '@/features/tasks/utils/creativePipeline';
import { formatCompletionPercentDisplay } from '@/features/tasks/utils/evaluationCompletion';
import { formatTaskCodeShort, getTaskDeadline } from '@/features/tasks/utils/taskDetail';
import { isMyTaskDateAtRisk } from '@/features/tasks/utils/taskDeadline';
import {
  canEvaluateTaskLayer,
  isCreativeWholeAssigned,
} from '@/features/tasks/utils/taskEvaluation';
import {
  areParentActionsLockedByActiveRevision,
  formatRevisionLabel,
  isRevisionTask,
  PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION,
} from '@/features/tasks/utils/taskRevision';
import { canEditTaskMeta, canOpenTaskMetaEdit } from '@/features/tasks/utils/taskStatusLock';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
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

function TaskNameCell({ record }: { record: MyTask }) {
  const name = record.taskName;
  if (!name) {
    return <span className={styles.empty}>—</span>;
  }

  const isRevision = isRevisionTask(record);
  const splitParent = isSplitParentTask(record);
  const splitChild = isSplitChildTask(record);
  const wholeAssigned = isCreativeWholeAssigned(record);
  const splitChildParentCode = splitChild ? inferParentTaskCodeFromSplit(record.taskCode) : null;

  return (
    <span className={styles.taskNameCell}>
      <Link
        to={buildMyTaskDetailPath(record.id)}
        state={{ from: record.taskCategory }}
        className={styles.taskNameLink}
      >
        <Tooltip title={name}>
          <span className={styles.truncate}>{name}</span>
        </Tooltip>
      </Link>
      <span className={styles.taskNameBadges}>
        {record.overtimeRequestId ? (
          <Tag color="orange" className={styles.shapeBadge}>
            OT
          </Tag>
        ) : null}
        {isRevision ? (
          <Tooltip title={`Đây là revision subtask · ${record.taskCode}`}>
            <Tag color="purple" className={styles.shapeBadge}>
              {formatRevisionLabel(record)}
            </Tag>
          </Tooltip>
        ) : null}
        {splitParent ? (
          <Tooltip title={SPLIT_PARENT_BADGE_HINT}>
            <Tag color="blue" className={styles.shapeBadge}>
              {SPLIT_PARENT_BADGE_LABEL}
            </Tag>
          </Tooltip>
        ) : null}
        {splitChild ? (
          <Tooltip
            title={
              splitChildParentCode
                ? `${SPLIT_CHILD_BADGE_HINT} · Task cha: ${splitChildParentCode}`
                : SPLIT_CHILD_BADGE_HINT
            }
          >
            <Tag color="cyan" className={styles.shapeBadge}>
              {SPLIT_CHILD_BADGE_LABEL}
            </Tag>
          </Tooltip>
        ) : null}
        {wholeAssigned ? (
          <Tooltip title={WHOLE_ASSIGNED_BADGE_HINT}>
            <Tag color="geekblue" className={styles.shapeBadge}>
              {WHOLE_ASSIGNED_BADGE_LABEL}
            </Tag>
          </Tooltip>
        ) : null}
      </span>
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
  const { can, role } = usePermission();
  const userId = currentUser?.id;
  const canEvaluate = can('EVALUATE_TASK');
  const [editingTask, setEditingTask] = useState<MyTask | null>(null);

  const canViewCreativeDeadlineColumn = canViewCreativeDeadline(
    currentUser?.role,
    currentUser?.department,
  );

  const editingUsesCreativeDrawer = Boolean(
    editingTask && shouldUseCreativePipelineEditDrawer(editingTask, role, userId),
  );

  const columns: ColumnsType<MyTask> = useMemo(() => {
    const canShowEdit = (task: MyTask) =>
      canOpenTaskMetaEdit(task, role, userId) || canOpenCreativePipelineEdit(task, role, userId);

    return [
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
        width: 200,
        ellipsis: true,
        sorter: getMyTaskColumnSorter('taskName'),
        render: (_: string, record) => <TaskNameCell record={record} />,
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
        render: (value?: number | null) =>
          value != null ? (
            formatCompletionPercentDisplay(value)
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
        width: 96,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const lockedByActiveRevision = areParentActionsLockedByActiveRevision(record);
          const showEdit = canShowEdit(record);
          const editTooltip = lockedByActiveRevision
            ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
            : canEditTaskMeta(record, role, userId) ||
                canOpenCreativePipelineEdit(record, role, userId)
              ? 'Sửa task'
              : 'Xem / sửa task';

          return (
            <Space size={0} className={styles.actions}>
              <Tooltip title="Xem chi tiết task">
                <Link
                  to={buildMyTaskDetailPath(record.id)}
                  state={{ from: record.taskCategory }}
                  aria-label={`View task ${record.taskName}`}
                >
                  <Button type="text" icon={<EyeOutlined />} />
                </Link>
              </Tooltip>
              {showEdit ? (
                <Tooltip title={editTooltip}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    aria-label={`Edit task ${record.taskName}`}
                    disabled={lockedByActiveRevision}
                    onClick={() => {
                      if (!lockedByActiveRevision) setEditingTask(record);
                    }}
                  />
                </Tooltip>
              ) : null}
            </Space>
          );
        },
      },
    ];
  }, [canViewCreativeDeadlineColumn, role, userId]);

  return (
    <>
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
          scroll={{ x: canViewCreativeDeadlineColumn ? 1356 : 1224 }}
          pagination={{
            defaultPageSize: PROJECT_TASKS_PAGE_SIZE,
            total,
            showSizeChanger: true,
            pageSizeOptions: [...PROJECT_TASKS_PAGE_SIZE_OPTIONS],
            showTotal: (count, range) => `Showing ${range[0]}-${range[1]} / ${count} tasks`,
          }}
        />
      </TableWrapper>

      {role === ROLES.HEAD ? (
        <EditHeadTaskModal
          open={editingTask !== null}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
      {role !== ROLES.HEAD && editingUsesCreativeDrawer ? (
        <CreativeEditDrawer
          open={editingTask !== null}
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
      {role !== ROLES.HEAD && !editingUsesCreativeDrawer ? (
        <EditTaskModal
          open={editingTask !== null}
          task={editingTask}
          role={role ?? ROLES.EMPLOYEE}
          canEvaluate={Boolean(
            canEvaluate && editingTask && canEvaluateTaskLayer(role, editingTask),
          )}
          onClose={() => setEditingTask(null)}
        />
      ) : null}
    </>
  );
}
