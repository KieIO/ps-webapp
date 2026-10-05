import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import {
  EVALUATE_TASK_ASSIGNED_QUANTITY_LABEL,
  EVALUATE_TASK_COMPLETED_QUANTITY_LABEL,
  EVALUATE_TASK_NOTE_LABEL,
  EVALUATE_TASK_NOTE_PLACEHOLDER,
  MY_TASK_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
} from '../../constants';
import { useUpdateMyTaskPmEvaluation } from '../../hooks/useUpdateMyTaskPmEvaluation';
import type { MyTask, UpdateMyTaskPmEvaluationRequest } from '../../schemas/task.schema';
import {
  computeCompletionPercentFromQuantity,
  deriveCompletedQuantityFromPercent,
} from '../../utils/evaluationCompletion';
import { formatTaskStaffNames } from '../../utils/staff';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface EvaluateTaskModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

type EvaluateTaskFormValues = UpdateMyTaskPmEvaluationRequest & {
  /** UI-only — drives %; not persisted separately. */
  completedQuantity: number;
};

export function EvaluateTaskModal({ open, task, onClose }: EvaluateTaskModalProps) {
  const [form] = Form.useForm<EvaluateTaskFormValues>();
  const { mutate, isPending } = useUpdateMyTaskPmEvaluation();

  useEffect(() => {
    if (open && task) {
      const assignedQuantity = Math.round(task.quantity ?? 0);
      form.setFieldsValue({
        completedQuantity: deriveCompletedQuantityFromPercent(
          task.completionPercent,
          assignedQuantity,
        ),
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

  const handleValuesChange = (changed: Partial<EvaluateTaskFormValues>) => {
    if (!('completedQuantity' in changed) || !task) return;
    const assignedQuantity = Math.round(task.quantity ?? 0);
    if (assignedQuantity <= 0) return;
    form.setFieldValue(
      'completionPercent',
      computeCompletionPercentFromQuantity(
        Math.round(changed.completedQuantity ?? 0),
        assignedQuantity,
      ),
    );
  };

  const handleFinish = (values: EvaluateTaskFormValues) => {
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

  const assignedQuantity = Math.round(task?.quantity ?? 0);

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
      {task ? (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectName}</span>
            <span className={styles.contextValue}>{task.projectName}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.taskName}</span>
            <span className={styles.contextValue}>{task.taskName}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.staffName}</span>
            <span className={styles.contextValue}>{formatTaskStaffNames(task.staff, '—')}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{EVALUATE_TASK_ASSIGNED_QUANTITY_LABEL}</span>
            <span className={styles.contextValue}>{assignedQuantity}</span>
          </div>
        </div>
      ) : null}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        requiredMark={false}
      >
        <div className={styles.row}>
          <Form.Item
            name="completedQuantity"
            label={EVALUATE_TASK_COMPLETED_QUANTITY_LABEL}
            rules={[
              { required: true, message: 'Nhập số lượng hoàn thành' },
              {
                type: 'integer',
                message: 'Số lượng phải là số nguyên',
              },
            ]}
          >
            <InputNumber min={0} precision={0} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="completionPercent"
            label={MY_TASK_COLUMN_HEADERS.completion}
            rules={[{ required: true, message: 'Nhập % hoàn thành' }]}
          >
            <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
        </div>
        <Form.Item name="pmEvaluation" label={MY_TASK_COLUMN_HEADERS.evaluation}>
          <Select allowClear placeholder="—" options={[...PROJECT_EVALUATION_SCORE_OPTIONS]} />
        </Form.Item>
        <Form.Item name="pmNote" label={EVALUATE_TASK_NOTE_LABEL}>
          <Input.TextArea rows={3} placeholder={EVALUATE_TASK_NOTE_PLACEHOLDER} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
