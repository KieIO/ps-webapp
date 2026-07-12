import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { DEPARTMENT_LABELS } from '@/features/projects/constants';
import type { ProjectDepartment } from '@/features/projects/schemas/project.schema';
import { ClassificationLevelBadge } from '../ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskDetailActions } from '../TaskDetailActions/TaskDetailActions';
import { TaskNameBadge } from '../TaskNameBadge/TaskNameBadge';
import { TaskStaffNameCell } from '../TaskStaffNameCell/TaskStaffNameCell';
import {
  TASK_CATEGORY_DEPARTMENT_LABELS,
  formatTaskDisplayId,
  formatTaskQuantity,
  getTaskDeadline,
} from '../../utils/taskDetail';
import type { ClassificationLevel, MyTask } from '../../schemas/task.schema';
import styles from './TaskDetailSummaryCard.module.scss';

interface TaskDetailSummaryCardProps {
  task: MyTask;
}

function formatTaskDepartment(task: MyTask): string {
  if (task.department && task.department in DEPARTMENT_LABELS) {
    return DEPARTMENT_LABELS[task.department as ProjectDepartment];
  }
  return TASK_CATEGORY_DEPARTMENT_LABELS[task.taskCategory];
}

export function TaskDetailSummaryCard({ task }: TaskDetailSummaryCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.header}>
          <h2 className={styles.taskId}>{formatTaskDisplayId(task)}</h2>
          <p className={styles.taskName}>{task.description}</p>
        </div>

        <TaskDetailActions task={task} />
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
          <p className={styles.metaValue}>{dayjs(task.date).format(DATE_FORMAT)}</p>
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
            {dayjs(getTaskDeadline(task)).format(DATE_FORMAT)}
          </p>
        </div>
      </div>
    </section>
  );
}
