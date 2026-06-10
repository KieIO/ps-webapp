import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import {
  MY_TASK_COLUMN_HEADERS,
  TASK_STATUS_CHANGE_NOTE_LABEL,
  TASK_STATUS_OPTIONS,
} from '../../constants';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import { TaskConfirmationBadge } from '../TaskConfirmationBadge/TaskConfirmationBadge';
import type { MyTask, UpdateMyTaskStatusRequest } from '../../schemas/task.schema';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface UpdateTaskStatusModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

export function UpdateTaskStatusModal({ open, task, onClose }: UpdateTaskStatusModalProps) {
  const [form] = Form.useForm<UpdateMyTaskStatusRequest>();
  const { mutate, isPending } = useUpdateMyTaskStatus();

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

  const handleFinish = (values: UpdateMyTaskStatusRequest) => {
    if (!task) return;

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
        <Form.Item
          name="staffConfirmation"
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <Select options={[...TASK_STATUS_OPTIONS]} placeholder="Select status" />
        </Form.Item>
        <Form.Item name="staffNote" label={TASK_STATUS_CHANGE_NOTE_LABEL}>
          <Input.TextArea rows={3} placeholder="Add a note for this status change" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
