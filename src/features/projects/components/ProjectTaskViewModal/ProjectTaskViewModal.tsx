import { Modal } from 'antd';
import { ClassificationLevelBadge } from '@/features/tasks/components/ClassificationLevelBadge/ClassificationLevelBadge';
import { TaskConfirmationBadge } from '@/features/tasks/components/TaskConfirmationBadge/TaskConfirmationBadge';
import { TaskNameBadge } from '@/features/tasks/components/TaskNameBadge/TaskNameBadge';
import { TaskStaffNameCell } from '@/features/tasks/components/TaskStaffNameCell/TaskStaffNameCell';
import { MY_TASK_COLUMN_HEADERS } from '@/features/tasks/constants';
import { formatTaskCodeShort } from '@/features/tasks/utils/taskDetail';
import type { ClassificationLevel, MyTask } from '@/features/tasks/schemas/task.schema';
import styles from './ProjectTaskViewModal.module.scss';

interface ProjectTaskViewModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

const renderText = (value: string) =>
  value ? <p className={styles.value}>{value}</p> : <p className={styles.empty}>—</p>;

export function ProjectTaskViewModal({ open, task, onClose }: ProjectTaskViewModalProps) {
  return (
    <Modal
      title={task ? `Task — ${task.taskName}` : 'Task detail'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={720}
    >
      {task && (
        <div className={styles.grid}>
          <div className={styles.field}>
            <span className={styles.label}>Task Code</span>
            {renderText(formatTaskCodeShort(task.taskCode))}
          </div>
          <div className={styles.field}>
            <span className={styles.label}>{MY_TASK_COLUMN_HEADERS.taskName}</span>
            <TaskNameBadge name={task.taskName} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>{MY_TASK_COLUMN_HEADERS.completion}</span>
            <p className={styles.value}>
              {task.completionPercent != null ? `${task.completionPercent}%` : '—'}
            </p>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Level</span>
            <ClassificationLevelBadge level={task.level as ClassificationLevel} />
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Quantity</span>
            <p className={styles.value}>{task.quantity}</p>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Assignee</span>
            <p className={styles.value}>
              <TaskStaffNameCell staff={task.staff} />
            </p>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Status</span>
            <TaskConfirmationBadge status={task.staffConfirmation} />
          </div>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <span className={styles.label}>Description</span>
            {renderText(task.description)}
          </div>
          {task.pmEvaluation && (
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>PM Evaluation</span>
              {renderText(task.pmEvaluation)}
            </div>
          )}
          {task.pmNote && (
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <span className={styles.label}>PM Note</span>
              {renderText(task.pmNote)}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
