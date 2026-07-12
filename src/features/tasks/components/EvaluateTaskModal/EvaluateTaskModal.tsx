import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { MY_TASK_COLUMN_HEADERS, PROJECT_EVALUATION_SCORE_OPTIONS } from '../../constants';
import { useUpdateMyTaskPmEvaluation } from '../../hooks/useUpdateMyTaskPmEvaluation';
import type { MyTask, UpdateMyTaskPmEvaluationRequest } from '../../schemas/task.schema';
import { formatTaskStaffNames } from '../../utils/staff';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface EvaluateTaskModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

export function EvaluateTaskModal({ open, task, onClose }: EvaluateTaskModalProps) {
  const [form] = Form.useForm<UpdateMyTaskPmEvaluationRequest>();
  const { mutate, isPending } = useUpdateMyTaskPmEvaluation();

  useEffect(() => {
    if (open && task) {
      form.setFieldsValue({
        completionPercent: task.completionPercent ?? 0,
        pmEvaluation: task.pmEvaluation,
        pmNote: task.pmNote,
      });
    }
  }, [open, task, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: UpdateMyTaskPmEvaluationRequest) => {
    if (!task) return;

    mutate(
      {
        id: task.id,
        payload: {
          completionPercent: values.completionPercent,
          pmEvaluation: values.pmEvaluation ?? '',
          pmNote: values.pmNote ?? '',
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
      title="Evaluate task"
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
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.staffName}:</span>{' '}
            {formatTaskStaffNames(task.staff, '—')}
          </span>
        </div>
      )}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="completionPercent"
          label={MY_TASK_COLUMN_HEADERS.completion}
          rules={[{ required: true, message: 'Completion is required' }]}
        >
          <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="pmEvaluation" label={MY_TASK_COLUMN_HEADERS.evaluation}>
          <Select allowClear placeholder="—" options={[...PROJECT_EVALUATION_SCORE_OPTIONS]} />
        </Form.Item>
        <Form.Item name="pmNote" label={MY_TASK_COLUMN_HEADERS.pmNote}>
          <Input.TextArea rows={3} placeholder="Add a note" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
