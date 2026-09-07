import { Alert, Tag, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import { ClassificationLevelBadge } from '../ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskDetailActions } from '../TaskDetailActions/TaskDetailActions';
import { TaskNameBadge } from '../TaskNameBadge/TaskNameBadge';
import { TaskStaffNameCell } from '../TaskStaffNameCell/TaskStaffNameCell';
import { formatTaskDateTime } from '../../utils/taskDates';
import {
  TASK_CATEGORY_DEPARTMENT_LABELS,
  formatTaskDisplayId,
  formatTaskQuantity,
  getTaskDeadline,
  getTaskStartDate,
} from '../../utils/taskDetail';
import {
  formatHasRevisionChildrenLabel,
  formatRevisionLabel,
  hasActiveRevisionChildren,
  hasRevisionChildren,
  inferParentTaskCodeFromRevision,
  isRevisionTask,
  PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION,
} from '../../utils/taskRevision';
import type { ClassificationLevel, MyTask } from '../../schemas/task.schema';
import styles from './TaskDetailSummaryCard.module.scss';

interface TaskDetailSummaryCardProps {
  task: MyTask;
  onOpenRevisionTab?: () => void;
}

function formatTaskDepartment(task: MyTask): string {
  if (task.department) {
    return getDepartmentLabel(task.department);
  }
  return TASK_CATEGORY_DEPARTMENT_LABELS[task.taskCategory];
}

export function TaskDetailSummaryCard({ task, onOpenRevisionTab }: TaskDetailSummaryCardProps) {
  const revision = isRevisionTask(task);
  const parentHasRevisions = hasRevisionChildren(task);
  const parentHasActiveRevision = hasActiveRevisionChildren(task);
  const parentCode = revision ? inferParentTaskCodeFromRevision(task.taskCode) : null;
  const displayName = formatTaskDisplayId(task);
  const hasRevisionLabel = formatHasRevisionChildrenLabel(task.revisionChildCount ?? 0, {
    activeCount: task.activeRevisionChildCount ?? 0,
  });

  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.header}>
          <p className={styles.taskCode} title={task.taskCode}>
            {task.taskCode}
          </p>
          <div className={styles.titleRow}>
            <h2 className={styles.taskTitle}>{displayName}</h2>
            {revision ? <Tag color="purple">{formatRevisionLabel(task)}</Tag> : null}
            {parentHasRevisions ? (
              <Tooltip
                title={
                  parentHasActiveRevision
                    ? PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION
                    : 'Mở tab Revision'
                }
              >
                <Tag
                  color={parentHasActiveRevision ? 'gold' : 'cyan'}
                  className={onOpenRevisionTab ? styles.clickableTag : undefined}
                  role={onOpenRevisionTab ? 'button' : undefined}
                  tabIndex={onOpenRevisionTab ? 0 : undefined}
                  onClick={onOpenRevisionTab}
                  onKeyDown={(event) => {
                    if (!onOpenRevisionTab) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpenRevisionTab();
                    }
                  }}
                >
                  {hasRevisionLabel}
                </Tag>
              </Tooltip>
            ) : null}
          </div>
          {parentHasActiveRevision ? (
            <Alert
              type="warning"
              showIcon
              className={styles.activeRevisionAlert}
              message="Đang có revision chưa hoàn tất"
              description={
                <span>
                  {PARENT_ACTIONS_LOCKED_BY_ACTIVE_REVISION}{' '}
                  {onOpenRevisionTab ? (
                    <button
                      type="button"
                      className={styles.alertAction}
                      onClick={onOpenRevisionTab}
                    >
                      Mở tab Revision
                    </button>
                  ) : null}
                </span>
              }
            />
          ) : null}
          {task.description ? <p className={styles.taskDescription}>{task.description}</p> : null}
          {revision && task.parentTaskId ? (
            <p className={styles.parentLink}>
              Revision của{' '}
              <Link to={buildMyTaskDetailPath(task.parentTaskId)}>{parentCode ?? 'task gốc'}</Link>
            </p>
          ) : null}
        </div>

        <TaskDetailActions task={task} onOpenRevisionTab={onOpenRevisionTab} />
      </div>

      <div className={styles.grid}>
        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Task type</p>
          <p className={styles.metaValue}>
            <TaskNameBadge name={task.taskName} />
          </p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Project</p>
          <p className={styles.metaValue}>{task.projectName}</p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Department</p>
          <p className={styles.metaValue}>{formatTaskDepartment(task)}</p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Level</p>
          <p className={styles.metaValue}>
            <ClassificationLevelBadge level={task.level as ClassificationLevel} />
          </p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Assignee</p>
          <p className={styles.metaValue}>
            <TaskStaffNameCell staff={task.staff} showAvatarForFirst />
          </p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Start date</p>
          <p className={styles.metaValue}>{formatTaskDateTime(getTaskStartDate(task))}</p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Status</p>
          <p className={styles.metaValue}>
            <TaskConfirmationBadge status={task.staffConfirmation} />
          </p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Quantity</p>
          <p className={styles.metaValue}>{formatTaskQuantity(task)}</p>
        </div>

        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>Deadline</p>
          <p className={`${styles.metaValue} ${styles.deadline}`}>
            {formatTaskDateTime(getTaskDeadline(task))}
          </p>
        </div>
      </div>
    </section>
  );
}
