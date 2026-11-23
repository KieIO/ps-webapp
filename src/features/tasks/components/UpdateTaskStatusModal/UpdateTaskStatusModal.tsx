import { Alert, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { useEffect, useMemo } from 'react';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { usePermission } from '@/shared/hooks/usePermission';
import { MY_TASK_COLUMN_HEADERS, TASK_STATUS_CHANGE_NOTE_LABEL } from '../../constants';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import type { MyTask, TaskConfirmationStatus } from '../../schemas/task.schema';
import {
  bucketToStaffConfirmation,
  getTaskStatusPickerOptions,
  resolveTaskStatusPickerBucket,
  TASK_SUMMARY_BUCKET_LABELS,
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
import styles from '../EditTaskModal/EditTaskModal.module.scss';

type StatusFormValues = {
  statusBucket: TaskSummaryBucket;
  staffNote?: string;
  actualHours?: number;
};

interface UpdateTaskStatusModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
  /**
   * When set, status is fixed (no dropdown) — guided staff finish → «Cần đánh giá».
   */
  lockedStatus?: TaskConfirmationStatus;
}

export function UpdateTaskStatusModal({
  open,
  task,
  onClose,
  lockedStatus,
}: UpdateTaskStatusModalProps) {
  const [form] = Form.useForm<StatusFormValues>();
  const { mutate, isPending } = useUpdateMyTaskStatus();
  const { role } = usePermission();
  const userId = useAppSelector((state) => state.auth.user?.id);
  const statusEditable = task ? canChangeTaskStatus(task, role, userId) : true;
  const statusLockMessage =
    task && isCancelledTask(task) ? TASK_STATUS_LOCKED_MESSAGE : TASK_STATUS_ASSIGNEE_ONLY_MESSAGE;
  const statusOptions = useMemo(
    () => getTaskStatusPickerOptions(role, task ?? undefined),
    [role, task],
  );
  const isOtTask = Boolean(task?.overtimeRequestId);
  const selectedBucket = Form.useWatch('statusBucket', form);
  const isFinishFlow = lockedStatus === 'finished';
  const effectiveBucket: TaskSummaryBucket | undefined = isFinishFlow
    ? 'completed'
    : selectedBucket;
  const requiresActualHours = isOtTask && effectiveBucket === 'completed';

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        statusBucket: isFinishFlow ? 'completed' : resolveTaskStatusPickerBucket(task),
        staffNote: task.staffNote,
        actualHours: task.actualHours ?? undefined,
      });
    }
  }, [open, task, form, isFinishFlow]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: StatusFormValues) => {
    if (!task) return;
    const bucket: TaskSummaryBucket = isFinishFlow ? 'completed' : values.statusBucket;
    const mapped = bucketToStaffConfirmation(bucket, role, task);
    if (!mapped.ok) {
      message.warning(mapped.error);
      return;
    }
    const nextStatus = mapped.status;

    if (!canChangeTaskStatus(task, role, userId) && nextStatus !== task.staffConfirmation) {
      return;
    }

    if (isTransitioningToCancelled(task.staffConfirmation, nextStatus)) {
      if (!canCancelTask(role)) return;
      const confirmed = await confirmCancelTask();
      if (!confirmed) return;
    }

    mutate(
      {
        id: task.id,
        staffConfirmation: nextStatus,
        staffNote: values.staffNote ?? '',
        actualHours: values.actualHours,
      },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title={isFinishFlow ? 'Hoàn thành task' : 'Update status'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={isFinishFlow ? 'Hoàn thành' : 'Save'}
      confirmLoading={isPending}
      okButtonProps={{ disabled: !statusEditable }}
      destroyOnHidden
      width={480}
    >
      {task && (
        <div className={styles.readOnly}>
          <span>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectName}:</span>{' '}
            {task.projectName}
          </span>
          <span>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.taskName}:</span>{' '}
            {task.taskName}
          </span>
          <span>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.confirmation}:</span>{' '}
            <TaskConfirmationBadge
              status={task.staffConfirmation}
              completionPercent={task.completionPercent}
              pmEvaluation={task.pmEvaluation}
            />
          </span>
          {isOtTask ? (
            <Alert
              type="info"
              showIcon
              message="Task OT — cần nhập số giờ thực tế khi hoàn thành"
            />
          ) : null}
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        {isFinishFlow ? (
          <Form.Item name="statusBucket" hidden>
            <Input type="hidden" />
          </Form.Item>
        ) : (
          <>
            <p className={styles.sectionTitle}>{MY_TASK_COLUMN_HEADERS.confirmation}</p>
            {!statusEditable ? (
              <Alert
                type="info"
                showIcon
                message={statusLockMessage}
                style={{ marginBottom: 12 }}
              />
            ) : null}
            <Form.Item
              name="statusBucket"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select
                options={statusOptions}
                placeholder="Select status"
                disabled={!statusEditable}
              />
            </Form.Item>
          </>
        )}
        {isFinishFlow ? (
          <p className={styles.sectionTitle}>
            Trạng thái mới: {TASK_SUMMARY_BUCKET_LABELS.completed}
          </p>
        ) : null}
        {requiresActualHours ? (
          <Form.Item
            name="actualHours"
            label="Số giờ thực tế"
            rules={[
              { required: true, message: 'Nhập số giờ thực tế' },
              { type: 'number', min: 0.5, message: 'Phải lớn hơn 0' },
            ]}
          >
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} addonAfter="giờ" />
          </Form.Item>
        ) : null}
        <Form.Item
          name="staffNote"
          label={TASK_STATUS_CHANGE_NOTE_LABEL}
          rules={
            requiresActualHours
              ? [{ required: true, message: 'Nhập ghi chú khi hoàn thành task OT' }]
              : undefined
          }
        >
          <Input.TextArea
            rows={3}
            placeholder="Add a note for this status change"
            disabled={!statusEditable}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
