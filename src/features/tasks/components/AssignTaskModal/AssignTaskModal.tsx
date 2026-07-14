import { Form, Input, Modal, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useAssignMyTask } from '../../hooks/useAssignMyTask';
import {
  formatTaskStaffNames,
  mergeStaffSelectOptions,
  resolveStaffFromUserId,
  staffOptionKey,
} from '../../utils/staff';
import type { MyTask } from '../../schemas/task.schema';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface AssignTaskModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

type AssignTaskFormValues = {
  staffUserId?: string;
  staffNote: string;
};

export function AssignTaskModal({ open, task, onClose }: AssignTaskModalProps) {
  const [form] = Form.useForm<AssignTaskFormValues>();
  const { mutate, isPending } = useAssignMyTask();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions();
  const isProjectTask = task?.taskCategory === 'project';

  const staffSelectOptions = useMemo(
    () => mergeStaffSelectOptions(staffOptions, task?.staff ?? []),
    [staffOptions, task?.staff],
  );

  useEffect(() => {
    if (task && open) {
      form.setFieldsValue({
        staffUserId: task.staff[0] ? staffOptionKey(task.staff[0]) : undefined,
        staffNote: task.staffNote,
      });
    }
  }, [task, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: AssignTaskFormValues) => {
    if (!task) return;

    mutate(
      {
        id: task.id,
        payload: {
          staff: resolveStaffFromUserId(values.staffUserId, staffOptions, task.staff),
          staffNote: values.staffNote ?? '',
        },
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
      title={task ? `Assign task — ${task.taskCode}` : 'Assign task'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Assign"
      confirmLoading={isPending}
      destroyOnHidden
      width={520}
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
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.staffName}:</span>{' '}
            {formatTaskStaffNames(task.staff)}
          </span>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <p className={styles.sectionTitle}>Staff</p>
        <Form.Item
          name="staffUserId"
          label={MY_TASK_COLUMN_HEADERS.staffName}
          rules={[
            {
              required: true,
              message: isProjectTask
                ? 'Select a staff member for this project task'
                : 'Select a staff member for this task',
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select staff for this task"
            options={staffSelectOptions}
          />
        </Form.Item>
        <Form.Item name="staffNote" label={MY_TASK_COLUMN_HEADERS.staffNote}>
          <Input.TextArea rows={3} placeholder="Add a note for this assignment" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
