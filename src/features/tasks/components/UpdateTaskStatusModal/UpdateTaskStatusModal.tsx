import { Alert, Form, Input, Modal, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { usePermission } from '@/shared/hooks/usePermission';
import { MY_TASK_COLUMN_HEADERS, TASK_STATUS_CHANGE_NOTE_LABEL } from '../../constants';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import type { MyTask, UpdateMyTaskStatusRequest } from '../../schemas/task.schema';
import {
  canCancelTask,
  canChangeTaskStatus,
  confirmCancelTask,
  getTaskStatusOptionsForRole,
  isTransitioningToCancelled,
  TASK_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface UpdateTaskStatusModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

export function UpdateTaskStatusModal({ open, task, onClose }: UpdateTaskStatusModalProps) {
  const [form] = Form.useForm<UpdateMyTaskStatusRequest>();
  const { mutate, isPending } = useUpdateMyTaskStatus();
  const { role } = usePermission();
  const statusEditable = task ? canChangeTaskStatus(task, role) : true;
  const statusOptions = useMemo(
    () => getTaskStatusOptionsForRole(role, task?.staffConfirmation),
    [role, task?.staffConfirmation],
  );

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        staffConfirmation: task.staffConfirmation,
        staffNote: task.staffNote,
      });
    }
  }, [open, task, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: UpdateMyTaskStatusRequest) => {
    if (!task) return;
    if (!canChangeTaskStatus(task, role) && values.staffConfirmation !== task.staffConfirmation) {
      return;
    }

    if (isTransitioningToCancelled(task.staffConfirmation, values.staffConfirmation)) {
      if (!canCancelTask(role)) return;
      const confirmed = await confirmCancelTask();
      if (!confirmed) return;
    }

    mutate(
      {
        id: task.id,
        staffConfirmation: values.staffConfirmation,
        staffNote: values.staffNote ?? '',
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
      title="Update status"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save"
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
            <TaskConfirmationBadge status={task.staffConfirmation} />
          </span>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <p className={styles.sectionTitle}>{MY_TASK_COLUMN_HEADERS.confirmation}</p>
        {!statusEditable ? (
          <Alert
            type="info"
            showIcon
            message={TASK_STATUS_LOCKED_MESSAGE}
            style={{ marginBottom: 12 }}
          />
        ) : null}
        <Form.Item
          name="staffConfirmation"
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <Select options={statusOptions} placeholder="Select status" disabled={!statusEditable} />
        </Form.Item>
        <Form.Item name="staffNote" label={TASK_STATUS_CHANGE_NOTE_LABEL}>
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
