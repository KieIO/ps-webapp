import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, InputNumber, message } from 'antd';
import classNames from 'classnames';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { TASK_STATUS_CHANGE_NOTE_LABEL } from '../../constants';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import type { MyTask } from '../../schemas/task.schema';
import {
  bucketToStaffConfirmation,
  getTaskStatusPickerOptions,
  resolveTaskStatusPickerBucket,
  TASK_SUMMARY_BUCKET_VARIANT,
  type TaskSummaryBucket,
} from '../../utils/taskConfirmationSummary';
import {
  canCancelTask,
  canChangeTaskStatus,
  confirmCancelTask,
  isCancelledTask,
  isTransitioningToCancelled,
  TASK_STATUS_ASSIGNEE_ONLY_MESSAGE,
  TASK_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import styles from './TaskDetailStatusPanel.module.scss';

const CHIP_VARIANT_CLASS: Record<string, string> = {
  completed: styles.chipCompleted,
  'in-progress': styles.chipInProgress,
  pending: styles.chipPending,
  overdue: styles.chipOverdue,
  cancelled: styles.chipCancelled,
};

interface TaskDetailStatusPanelProps {
  task: MyTask;
}

export function TaskDetailStatusPanel({ task }: TaskDetailStatusPanelProps) {
  const { role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const statusEditable = canChangeTaskStatus(task, role, userId);
  const statusLockMessage = isCancelledTask(task)
    ? TASK_STATUS_LOCKED_MESSAGE
    : TASK_STATUS_ASSIGNEE_ONLY_MESSAGE;
  const statusOptions = useMemo(() => getTaskStatusPickerOptions(role, task), [role, task]);
  const [selectedBucket, setSelectedBucket] = useState<TaskSummaryBucket>(() =>
    resolveTaskStatusPickerBucket(task),
  );
  const [note, setNote] = useState(task.staffNote);
  const [actualHours, setActualHours] = useState<number | null>(task.actualHours ?? null);
  const { mutate, isPending } = useUpdateMyTaskStatus();
  const isOtTask = Boolean(task.overtimeRequestId);
  const requiresActualHours = isOtTask && selectedBucket === 'completed';
  const currentBucket = resolveTaskStatusPickerBucket(task);

  useEffect(() => {
    setSelectedBucket(resolveTaskStatusPickerBucket(task));
    setNote(task.staffNote);
    setActualHours(task.actualHours ?? null);
  }, [task]);

  const hasChanges =
    statusEditable &&
    (selectedBucket !== currentBucket ||
      note.trim() !== task.staffNote.trim() ||
      (requiresActualHours && actualHours !== (task.actualHours ?? null)));

  const handleReset = () => {
    setSelectedBucket(resolveTaskStatusPickerBucket(task));
    setNote(task.staffNote);
    setActualHours(task.actualHours ?? null);
  };

  const handleSave = async () => {
    if (!statusEditable) return;

    if (requiresActualHours && (actualHours == null || actualHours <= 0)) {
      return;
    }
    if (requiresActualHours && !note.trim()) {
      return;
    }

    const mapped = bucketToStaffConfirmation(selectedBucket, role, task);
    if (!mapped.ok) {
      message.warning(mapped.error);
      return;
    }
    const nextStatus = mapped.status;

    if (isTransitioningToCancelled(task.staffConfirmation, nextStatus)) {
      if (!canCancelTask(role)) return;
      const confirmed = await confirmCancelTask();
      if (!confirmed) return;
    }

    mutate(
      {
        id: task.id,
        staffConfirmation: nextStatus,
        staffNote: note.trim(),
        actualHours: requiresActualHours ? (actualHours ?? undefined) : undefined,
      },
      {
        onSuccess: () => {
          setNote(note.trim());
        },
      },
    );
  };

  return (
    <div className={styles.panel}>
      <span className={styles.label}>Task status</span>

      {!statusEditable ? (
        <Alert type="info" showIcon message={statusLockMessage} style={{ marginBottom: 12 }} />
      ) : null}

      {isOtTask ? (
        <Alert
          type="info"
          showIcon
          message="Task OT — nhập số giờ thực tế khi hoàn thành"
          style={{ marginBottom: 12 }}
        />
      ) : null}

      <div className={styles.chips} role="group" aria-label="Task status">
        {statusOptions.map((option) => {
          const variant = TASK_SUMMARY_BUCKET_VARIANT[option.value];
          const isActive = selectedBucket === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={classNames(
                styles.chip,
                CHIP_VARIANT_CLASS[variant],
                isActive && styles.chipActive,
              )}
              aria-pressed={isActive}
              disabled={isPending || !statusEditable}
              onClick={() => {
                if (statusEditable) setSelectedBucket(option.value);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {requiresActualHours ? (
        <div className={styles.noteGroup}>
          <InputNumber
            className={styles.noteInput}
            min={0.5}
            step={0.5}
            value={actualHours}
            onChange={(value) => setActualHours(value)}
            placeholder="Số giờ thực tế"
            addonAfter="giờ"
            disabled={isPending || !statusEditable}
            style={{ width: '100%' }}
          />
        </div>
      ) : null}

      <div className={styles.noteGroup}>
        <Input.TextArea
          className={styles.noteInput}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={
            requiresActualHours ? 'Ghi chú (bắt buộc cho task OT)' : TASK_STATUS_CHANGE_NOTE_LABEL
          }
          autoSize={{ minRows: 1, maxRows: 3 }}
          disabled={isPending || !statusEditable}
          aria-label={TASK_STATUS_CHANGE_NOTE_LABEL}
        />
      </div>

      {hasChanges ? (
        <div className={styles.actions}>
          <Button
            type="text"
            className={styles.cancelBtn}
            onClick={handleReset}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => void handleSave()}
            loading={isPending}
            disabled={
              requiresActualHours && (actualHours == null || actualHours <= 0 || !note.trim())
            }
          >
            Save status
          </Button>
        </div>
      ) : null}
    </div>
  );
}
