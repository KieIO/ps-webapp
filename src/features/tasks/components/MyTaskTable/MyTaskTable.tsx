import { useMemo } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  StarOutlined,
  SyncOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import type { MyTaskColumnKey } from '../../constants';
import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath, DATE_FORMAT, DATETIME_SHORT_FORMAT } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { TableWrapper } from '@/shared/ui/TableWrapper/TableWrapper';
import { ClassificationLevelBadge } from '../ClassificationLevelBadge/ClassificationLevelBadge';
import { EvaluationLevelBadge } from '@/features/projects/components/EvaluationLevelBadge/EvaluationLevelBadge';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { ProjectStatusBadge } from '@/features/projects/components/ProjectStatusBadge/ProjectStatusBadge';
import type { EvaluationLevel } from '@/features/projects/schemas/project.schema';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskUrgencyColumnTitle } from '../TaskUrgencyColumnTitle/TaskUrgencyColumnTitle';
import { MY_TASKS_PAGE_SIZE, MY_TASKS_PAGE_SIZE_OPTIONS } from '../../constants';
import { useMyTaskColumns } from '../../hooks/useMyTaskColumns';
import type { ClassificationLevel, MyTask } from '../../schemas/task.schema';
import {
  buildMyTaskDataColumns,
  getMyTaskActionsWidth,
  getMyTaskTableScrollWidth,
} from '../../utils/myTaskColumns';
import { TaskStaffNameCell } from '../TaskStaffNameCell/TaskStaffNameCell';
import { resolveAssigneePlainLabel, resolveAssignedByDisplay } from '../../utils/assigneeDisplay';
import { getMyTaskCompletionProgressStatus, isMyTaskDateAtRisk } from '../../utils/taskDeadline';
import { getTaskDeadline } from '../../utils/taskDetail';
import type { CmProjectTaskScope } from '../../utils/taskListVisibility';
import {
  canEvaluateTaskLayer,
  EVALUATION_LAYER_BADGE_LABELS,
  EVALUATION_LAYER_TITLES,
  hasChEvaluation,
  hasHandoffEvaluation,
  isCreativePastChToCmHandoff,
  isCreativeWholeAssigned,
} from '../../utils/taskEvaluation';
import { formatEvaluationBadgeLabel, hasCmEvaluation } from '../../utils/evaluationRemainder';
import {
  inferParentTaskCodeFromSplit,
  isSplitChildTask,
  isSplitParentTask,
  SPLIT_CHILD_BADGE_HINT,
  SPLIT_CHILD_BADGE_LABEL,
  SPLIT_PARENT_BADGE_HINT,
  SPLIT_PARENT_BADGE_LABEL,
} from '../../utils/creativePipeline';
import {
  areParentActionsLockedByActiveRevision,
  formatHasRevisionChildrenLabel,
  formatRevisionLabel,
  hasActiveRevisionChildren,
  hasRevisionChildren,
  isRevisionTask,
  PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION,
} from '../../utils/taskRevision';
import {
  canChangeTaskStatus,
  isCancelledTask,
  TASK_STATUS_ASSIGNEE_ONLY_MESSAGE,
  TASK_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import { CompletionProgressCell } from '@/shared/ui/CompletionProgressCell/CompletionProgressCell';
import { DateWithRiskIndicator } from '@/shared/ui/DateWithRiskIndicator/DateWithRiskIndicator';
import { ProjectNameLink } from '@/shared/ui/ProjectNameLink/ProjectNameLink';
import { UserNameLink } from '@/shared/ui/UserNameLink/UserNameLink';
import styles from './MyTaskTable.module.scss';

interface MyTaskTableProps {
  tasks: MyTask[];
  loading: boolean;
  total: number;
  onEdit?: (task: MyTask) => void;
  /** Per-row gate for Edit (Admin/Head/creator + not finished). */
  canEditTask?: (task: MyTask) => boolean;
  onAssign?: (task: MyTask) => void;
  onUpdateStatus?: (task: MyTask) => void;
  onEvaluate?: (task: MyTask) => void;
  onDelete?: (task: MyTask) => void;
  canAssign?: boolean;
  canEvaluate?: boolean;
  deletingTaskId?: string | null;
  /** CM Project Tasks tab. Picks which evaluation badge a whole-assign row shows. */
  evaluationScope?: CmProjectTaskScope;
}

const renderLevel = (level: ClassificationLevel) => <ClassificationLevelBadge level={level} />;

const renderWrapText = (value: string) => {
  if (!value) return <span className={styles.empty}>—</span>;
  return <span className={styles.wrapText}>{value}</span>;
};

const renderText = (value: string) => {
  if (!value) return <span className={styles.empty}>—</span>;
  return (
    <Tooltip title={value}>
      <span className={styles.truncate}>{value}</span>
    </Tooltip>
  );
};

const renderTaskDetailLink = (
  label: string,
  record: MyTask,
  evaluationScope?: CmProjectTaskScope,
) => {
  if (!label) return <span className={styles.empty}>—</span>;

  const isRevision = isRevisionTask(record);
  const splitParent = isSplitParentTask(record);
  const splitChild = isSplitChildTask(record);
  const parentHasRevisions = hasRevisionChildren(record);
  const parentHasActiveRevision = hasActiveRevisionChildren(record);
  const evaluated = hasCmEvaluation(record);
  const wholeAssigned = isCreativeWholeAssigned(record);
  const showStaffBadge = evaluated && !(evaluationScope === 'received' && wholeAssigned);
  const showHandoffBadge =
    wholeAssigned && hasHandoffEvaluation(record) && evaluationScope !== 'staff';
  const showChBadge =
    isCreativePastChToCmHandoff(record) && hasChEvaluation(record) && evaluationScope !== 'staff';
  const remainderHint =
    record.evaluationRemainderTaskCode != null
      ? `Đã tách ${record.evaluationRemainderTaskCode}${
          record.evaluationRemainderQuantity != null
            ? ` (SL ${Math.round(record.evaluationRemainderQuantity)})`
            : ''
        }`
      : null;
  const splitChildParentCode = splitChild ? inferParentTaskCodeFromSplit(record.taskCode) : null;

  return (
    <span className={styles.taskNameCell}>
      <Link
        to={buildMyTaskDetailPath(record.id)}
        state={{ from: record.taskCategory }}
        className={styles.taskNameLink}
      >
        <Tooltip title={label}>
          <span className={styles.truncate}>{label}</span>
        </Tooltip>
      </Link>
      <span className={styles.taskNameBadges}>
        {record.overtimeRequestId ? (
          <Tag color="orange" className={styles.otBadge}>
            OT
          </Tag>
        ) : null}
        {isRevision ? (
          <Tooltip title={`Đây là revision subtask · ${record.taskCode}`}>
            <Tag color="purple" className={styles.otBadge}>
              {formatRevisionLabel(record)}
            </Tag>
          </Tooltip>
        ) : null}
        {splitParent ? (
          <Tooltip title={SPLIT_PARENT_BADGE_HINT}>
            <Tag color="blue" className={styles.otBadge}>
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
            <Tag color="blue" className={styles.otBadge}>
              {SPLIT_CHILD_BADGE_LABEL}
            </Tag>
          </Tooltip>
        ) : null}
        {showChBadge ? (
          <Tooltip title={EVALUATION_LAYER_TITLES.ch}>
            <Tag color="geekblue" className={styles.otBadge}>
              {EVALUATION_LAYER_BADGE_LABELS.ch}
            </Tag>
          </Tooltip>
        ) : null}
        {showHandoffBadge ? (
          <Tooltip title={EVALUATION_LAYER_TITLES.handoff}>
            <Tag color="gold" className={styles.otBadge}>
              {EVALUATION_LAYER_BADGE_LABELS.handoff}
            </Tag>
          </Tooltip>
        ) : null}
        {showStaffBadge ? (
          <Tooltip title={remainderHint ?? EVALUATION_LAYER_TITLES.staff}>
            <Tag color="green" className={styles.otBadge}>
              {formatEvaluationBadgeLabel(record)}
            </Tag>
          </Tooltip>
        ) : null}
        {parentHasRevisions ? (
          <Tooltip
            title={
              parentHasActiveRevision
                ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
                : 'Mở task và xem tab Revision'
            }
          >
            <Link
              to={buildMyTaskDetailPath(record.id, { tab: 'revision' })}
              state={{ from: record.taskCategory }}
              className={styles.revisionBadgeLink}
              onClick={(event) => event.stopPropagation()}
            >
              <Tag color={parentHasActiveRevision ? 'gold' : 'cyan'} className={styles.otBadge}>
                {formatHasRevisionChildrenLabel(record.revisionChildCount ?? 0, {
                  activeCount: record.activeRevisionChildCount ?? 0,
                })}
              </Tag>
            </Link>
          </Tooltip>
        ) : null}
      </span>
    </span>
  );
};

const renderDate = (value: string, record: MyTask, columnKey: MyTaskColumnKey) => (
  <DateWithRiskIndicator
    date={columnKey === 'date' ? getTaskDeadline(record) : value}
    atRisk={isMyTaskDateAtRisk(record, columnKey)}
    format={columnKey === 'date' ? DATETIME_SHORT_FORMAT : DATE_FORMAT}
  />
);

const renderCompletion = (value: number | undefined, record: MyTask) =>
  value != null ? (
    <CompletionProgressCell percent={value} status={getMyTaskCompletionProgressStatus(record)} />
  ) : (
    <span className={styles.empty}>Chưa đánh giá</span>
  );

const renderEvaluationLevel = (level: EvaluationLevel) => <EvaluationLevelBadge level={level} />;

export function MyTaskTable({
  tasks,
  loading,
  total,
  onEdit,
  canEditTask: canEditTaskRow,
  onAssign,
  onUpdateStatus,
  onEvaluate,
  onDelete,
  canAssign = false,
  canEvaluate = false,
  deletingTaskId = null,
  evaluationScope,
}: MyTaskTableProps) {
  const { columnDefs } = useMyTaskColumns();
  const { role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
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
      renderTaskName: (name, record) => renderTaskDetailLink(name, record, evaluationScope),
      renderConfirmation: (record) => (
        <TaskConfirmationBadge
          status={record.staffConfirmation}
          completionPercent={record.completionPercent}
          pmEvaluation={record.pmEvaluation}
        />
      ),
      renderProjectStatus: (status) => <ProjectStatusBadge status={status} />,
      renderProjectName: (record) => (
        <ProjectNameLink
          name={record.projectName}
          projectId={record.projectId}
          emptyClassName={styles.empty}
        />
      ),
      renderProjectManager: (record) => (
        <UserNameLink
          name={record.projectManager.name}
          userId={record.projectManager.userId}
          showAvatar
        />
      ),
      renderAssignedBy: (record) => {
        const display = resolveAssignedByDisplay(record);
        if (!display) return <span className={styles.empty}>—</span>;
        return (
          <>
            <UserNameLink name={display.name} userId={display.userId} showAvatar />
            {display.roleLabel ? <span> ({display.roleLabel})</span> : null}
          </>
        );
      },
      renderStaffName: (record) => (
        <TaskStaffNameCell
          staff={record.staff}
          plainLabel={resolveAssigneePlainLabel(role, record)}
        />
      ),
      renderDate,
      renderCompletion,
      renderUrgency: (urgency) => <ProjectUrgencyBadge urgency={urgency} />,
      renderUrgencyTitle: () => <TaskUrgencyColumnTitle />,
      renderDescription: (record) => renderWrapText(record.description),
    });

    return [
      ...dataColumns,
      {
        title: '',
        key: 'actions',
        width: actionsWidth,
        fixed: 'right',
        render: (_, record) => {
          const lockedByActiveRevision = areParentActionsLockedByActiveRevision(record);
          const canUpdateStatus =
            Boolean(onUpdateStatus) &&
            canChangeTaskStatus(record, role, userId) &&
            !lockedByActiveRevision;
          const statusTooltip = lockedByActiveRevision
            ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
            : canUpdateStatus
              ? 'Update status'
              : isCancelledTask(record)
                ? TASK_STATUS_LOCKED_MESSAGE
                : TASK_STATUS_ASSIGNEE_ONLY_MESSAGE;
          const editTooltip = lockedByActiveRevision
            ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
            : 'Edit';
          const evaluateTooltip = lockedByActiveRevision
            ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
            : 'Evaluate';

          return (
            <div className={styles.actions}>
              {onUpdateStatus ? (
                <Tooltip title={statusTooltip}>
                  <Button
                    type="text"
                    icon={<SyncOutlined />}
                    aria-label={`Update status for ${record.taskName}`}
                    disabled={!canUpdateStatus}
                    onClick={() => {
                      if (canUpdateStatus) onUpdateStatus(record);
                    }}
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
              {onEdit && (!canEditTaskRow || canEditTaskRow(record)) ? (
                <Tooltip title={editTooltip}>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    aria-label={`Edit ${record.taskName}`}
                    disabled={lockedByActiveRevision}
                    onClick={() => {
                      if (!lockedByActiveRevision) onEdit(record);
                    }}
                  />
                </Tooltip>
              ) : null}
              {canEvaluate && onEvaluate && canEvaluateTaskLayer(role, record) ? (
                <Tooltip title={evaluateTooltip}>
                  <Button
                    type="text"
                    icon={<StarOutlined />}
                    aria-label={`Evaluate ${record.taskName}`}
                    disabled={lockedByActiveRevision}
                    onClick={() => {
                      if (!lockedByActiveRevision) onEvaluate(record);
                    }}
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
          );
        },
      },
    ];
  }, [
    actionsWidth,
    canAssign,
    canEditTaskRow,
    canEvaluate,
    columnDefs,
    deletingTaskId,
    evaluationScope,
    onAssign,
    onDelete,
    onEdit,
    onEvaluate,
    onUpdateStatus,
    role,
    userId,
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
          defaultPageSize: MY_TASKS_PAGE_SIZE,
          total,
          showSizeChanger: true,
          pageSizeOptions: [...MY_TASKS_PAGE_SIZE_OPTIONS],
          showTotal: (count, range) => `Showing ${range[0]}-${range[1]} / ${count} tasks`,
        }}
      />
    </TableWrapper>
  );
}
