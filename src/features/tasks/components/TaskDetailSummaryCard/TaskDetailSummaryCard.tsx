import { Avatar } from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/config/constants';
import { ClassificationLevelBadge } from '../ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskNameBadge } from '../TaskNameBadge/TaskNameBadge';
import {
  TASK_CATEGORY_DEPARTMENT_LABELS,
  formatTaskDisplayId,
  formatTaskQuantity,
  getTaskDeadline,
} from '../../utils/taskDetail';
import { formatTaskStaffNames } from '../../utils/staff';
import { getInitials } from '@/shared/utils/person';
import type { ClassificationLevel, MyTask } from '../../schemas/task.schema';
import styles from './TaskDetailSummaryCard.module.scss';

interface TaskDetailSummaryCardProps {
  task: MyTask;
}

export function TaskDetailSummaryCard({ task }: TaskDetailSummaryCardProps) {
  const primaryStaff = task.staff[0];
  const assigneeName = formatTaskStaffNames(task.staff);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.taskId}>{formatTaskDisplayId(task)}</h2>
        <p className={styles.taskName}>{task.description}</p>
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
          <p className={styles.metaValue}>{TASK_CATEGORY_DEPARTMENT_LABELS[task.taskCategory]}</p>
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
            {primaryStaff ? (
              <span className={styles.assignee}>
                <Avatar size={28} className={styles.avatar}>
                  {getInitials(primaryStaff.name)}
                </Avatar>
                {assigneeName}
              </span>
            ) : (
              assigneeName
            )}
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
