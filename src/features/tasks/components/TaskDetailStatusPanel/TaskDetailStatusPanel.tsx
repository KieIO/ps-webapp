import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import classNames from 'classnames';
import {
  CONFIRMATION_VARIANT,
  TASK_STATUS_CHANGE_NOTE_LABEL,
  TASK_STATUS_OPTIONS,
} from '../../constants';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import type { MyTask, TaskConfirmationStatus } from '../../schemas/task.schema';
import styles from './TaskDetailStatusPanel.module.scss';

const CHIP_VARIANT_CLASS: Record<string, string> = {
  completed: styles.chipCompleted,
  'in-progress': styles.chipInProgress,
  pending: styles.chipPending,
  overdue: styles.chipOverdue,
};

interface TaskDetailStatusPanelProps {
  task: MyTask;
}

export function TaskDetailStatusPanel({ task }: TaskDetailStatusPanelProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskConfirmationStatus>(
    task.staffConfirmation,
  );
  const [note, setNote] = useState(task.staffNote);
  const { mutate, isPending } = useUpdateMyTaskStatus();

  useEffect(() => {
    setSelectedStatus(task.staffConfirmation);
    setNote(task.staffNote);
  }, [task.id, task.staffConfirmation, task.staffNote]);

  const hasChanges =
    selectedStatus !== task.staffConfirmation || note.trim() !== task.staffNote.trim();

  const handleReset = () => {
    setSelectedStatus(task.staffConfirmation);
    setNote(task.staffNote);
  };

  const handleSave = () => {
    mutate(
      {
        id: task.id,
        staffConfirmation: selectedStatus,
        staffNote: note.trim(),
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
      <span className={styles.label}>Status</span>

      <div className={styles.chips} role="group" aria-label="Task status">
        {TASK_STATUS_OPTIONS.map((option) => {
          const variant = CONFIRMATION_VARIANT[option.value];
          const isActive = selectedStatus === option.value;

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
              disabled={isPending}
              onClick={() => setSelectedStatus(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={styles.noteGroup}>
        <Input.TextArea
          className={styles.noteInput}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={TASK_STATUS_CHANGE_NOTE_LABEL}
          autoSize={{ minRows: 1, maxRows: 3 }}
          disabled={isPending}
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
          <Button type="primary" onClick={handleSave} loading={isPending}>
            Save status
          </Button>
        </div>
      ) : null}
    </div>
  );
}
