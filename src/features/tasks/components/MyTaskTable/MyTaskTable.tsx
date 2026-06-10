import { useMemo } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import type { MyTaskColumnKey } from '../../constants';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { ClassificationLevelBadge } from '../ClassificationLevelBadge/ClassificationLevelBadge';
import { EvaluationLevelBadge } from '@/features/projects/components/EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectStatusBadge } from '@/features/projects/components/ProjectStatusBadge/ProjectStatusBadge';
import type { EvaluationLevel } from '@/features/projects/schemas/project.schema';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskNameBadge } from '../TaskNameBadge/TaskNameBadge';
import { MY_TASKS_PAGE_SIZE, MY_TASKS_PAGE_SIZE_OPTIONS } from '../../constants';
import { useMyTaskColumns } from '../../hooks/useMyTaskColumns';
import type { ClassificationLevel, MyTask } from '../../schemas/task.schema';
import {
  buildMyTaskDataColumns,
  getMyTaskActionsWidth,
  getMyTaskTableScrollWidth,
} from '../../utils/myTaskColumns';
import { formatTaskStaffNames } from '../../utils/staff';
import {
  getMyTaskCompletionProgressStatus,
  isMyTaskDateAtRisk,
} from '../../utils/taskDeadline';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { DateWithRiskIndicator } from '@/shared/ui/DateWithRiskIndicator/DateWithRiskIndicator';
import { PersonAvatarCell } from '@/shared/ui/PersonAvatarCell/PersonAvatarCell';
import styles from './MyTaskTable.module.scss';

interface MyTaskTableProps {
  tasks: MyTask[];
  loading: boolean;
  total: number;
  onEdit?: (task: MyTask) => void;
  onAssign?: (task: MyTask) => void;
  onUpdateStatus?: (task: MyTask) => void;
  onEvaluate?: (task: MyTask) => void;
  onDelete?: (task: MyTask) => void;
  canAssign?: boolean;
  canEvaluate?: boolean;
  deletingTaskId?: string | null;
}

const renderLevel = (level: ClassificationLevel) => (
  <ClassificationLevelBadge level={level} />
);

const renderText = (value: string) => {
  if (!value) return <span className={styles.empty}>—</span>;
  return (
    <Tooltip title={value}>
      <span className={styles.truncate}>{value}</span>
    </Tooltip>
  );
};

const renderDate = (value: string, record: MyTask, columnKey: MyTaskColumnKey) => (
  <DateWithRiskIndicator date={value} atRisk={isMyTaskDateAtRisk(record, columnKey)} />
);

const renderCompletion = (value: number | undefined, record: MyTask) =>
  value != null ? (
    <CompletionProgressCell
      percent={value}
      status={getMyTaskCompletionProgressStatus(record)}
    />
  ) : (
    <span className={styles.empty}>—</span>
  );

const renderEvaluationLevel = (level: EvaluationLevel) => (
  <EvaluationLevelBadge level={level} />
);

export function MyTaskTable({
  tasks,
  loading,
  total,
  onEdit,
  onAssign,
  onUpdateStatus,
  onEvaluate,
  onDelete,
  canAssign = false,
  canEvaluate = false,
  deletingTaskId = null,
}: MyTaskTableProps) {
  const { columnDefs } = useMyTaskColumns();
  const actionsWidth = getMyTaskActionsWidth({
    hasUpdateStatus: Boolean(onUpdateStatus),
    canAssign: canAssign && Boolean(onAssign),
    hasEdit: Boolean(onEdit),
    canEvaluate: canEvaluate && Boolean(onEvaluate),
    hasDelete: Boolean(onDelete),
  });
  const scrollX = getMyTaskTableScrollWidth(columnDefs, actionsWidth);

  const columns: ColumnsType<MyTask> = useMemo(() => {
    const dataColumns = buildMyTaskDataColumns(columnDefs, {
      renderLevel,
      renderEvaluationLevel,
      renderText,
      renderTaskName: (name: string) => <TaskNameBadge name={name} />,
      renderConfirmation: (status) => <TaskConfirmationBadge status={status} />,
      renderProjectStatus: (status) => <ProjectStatusBadge status={status} />,
      renderProjectManager: (record) => (
        <PersonAvatarCell name={record.projectManager.name} />
      ),
      renderStaffName: (record) => formatTaskStaffNames(record.staff),
      renderDate,
      renderCompletion,
      renderDescription: (record) => {
        if (!record.description) {
          return <span className={styles.empty}>—</span>;
        }
        return (
          <Link
            to={buildMyTaskDetailPath(record.id)}
            state={{ from: record.taskCategory }}
            className={styles.taskNameLink}
          >
            <Tooltip title={record.description}>
              <span className={styles.truncate}>{record.description}</span>
            </Tooltip>
          </Link>
        );
      },
    });

    return [
      ...dataColumns,
      {
        title: '',
        key: 'actions',
        width: actionsWidth,
        fixed: 'right',
        render: (_, record) => (
          <div className={styles.actions}>
            {onUpdateStatus ? (
              <Tooltip title="Update status">
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  aria-label={`Update status for ${record.taskName}`}
                  onClick={() => onUpdateStatus(record)}
                />
              </Tooltip>
            ) : null}
            {canAssign && onAssign ? (
              <Tooltip title="Assign staff">
                <Button
                  type="text"
                  icon={<UserAddOutlined />}
                  aria-label={`Assign staff for ${record.taskName}`}
                  onClick={() => onAssign(record)}
                />
              </Tooltip>
            ) : null}
            {onEdit ? (
              <Tooltip title="Edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  aria-label={`Edit ${record.taskName}`}
                  onClick={() => onEdit(record)}
                />
              </Tooltip>
            ) : null}
            {canEvaluate && onEvaluate ? (
              <Tooltip title="Evaluate">
                <Button
                  type="text"
                  icon={<StarOutlined />}
                  aria-label={`Evaluate ${record.taskName}`}
                  onClick={() => onEvaluate(record)}
                />
              </Tooltip>
            ) : null}
            {onDelete ? (
              <Popconfirm
                title="Delete this task?"
                description="This action cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onConfirm={() => onDelete(record)}
              >
                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${record.taskName}`}
                    loading={deletingTaskId === record.id}
                    disabled={deletingTaskId != null && deletingTaskId !== record.id}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
          </div>
        ),
      },
    ];
  }, [
    actionsWidth,
    canAssign,
    canEvaluate,
    columnDefs,
    deletingTaskId,
    onAssign,
    onDelete,
    onEdit,
    onEvaluate,
    onUpdateStatus,
  ]);

  return (
    <TableWrapper
      loading={loading}
      isEmpty={!loading && tasks.length === 0}
      emptyTitle="No tasks found"
      emptyDescription="You have no assigned tasks matching your filters."
    >
      <Table
        className={styles.table}
        rowKey="id"
        columns={columns}
        dataSource={tasks}
        scroll={{ x: scrollX }}
        pagination={{
          pageSize: MY_TASKS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...MY_TASKS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) =>
            `Showing ${range[0]}-${range[1]} / ${count} tasks`,
        }}
      />
    </TableWrapper>
  );
}
