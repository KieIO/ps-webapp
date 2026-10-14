import { Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { buildMyTaskDetailPath } from '@/config/constants';
import {
  EVALUATE_TASK_ASSIGNED_QUANTITY_LABEL,
  EVALUATE_TASK_COMPLETED_QUANTITY_LABEL,
  EVALUATE_TASK_NOTE_LABEL,
  EVALUATE_TASK_NOTE_PLACEHOLDER,
  EVALUATE_TASK_REMAINDER_BUTTON,
  EVALUATE_TASK_REMAINDER_HINT,
  MY_TASK_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
} from '../../constants';
import { useSpawnEvaluationRemainder } from '../../hooks/useSpawnEvaluationRemainder';
import { useUpdateMyTaskPmEvaluation } from '../../hooks/useUpdateMyTaskPmEvaluation';
import type { MyTask, UpdateMyTaskPmEvaluationRequest } from '../../schemas/task.schema';
import {
  computeCompletionPercentFromQuantity,
  deriveCompletedQuantityFromPercent,
} from '../../utils/evaluationCompletion';
import {
  canSpawnEvaluationRemainder,
  computeAcceptedRemainderQuantity,
} from '../../utils/evaluationRemainder';
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

type RemainderLink = {
  id: string;
  taskName: string;
  taskCode: string;
};

export function EvaluateTaskModal({ open, task, onClose }: EvaluateTaskModalProps) {
  const [form] = Form.useForm<EvaluateTaskFormValues>();
  const { mutate, isPending } = useUpdateMyTaskPmEvaluation();
  const { mutate: spawnRemainder, isPending: isSpawning } = useSpawnEvaluationRemainder();
  const [workingTask, setWorkingTask] = useState<MyTask | null>(task);
  const [remainderLink, setRemainderLink] = useState<RemainderLink | null>(null);

  useEffect(() => {
    if (!open) {
      setRemainderLink(null);
      setWorkingTask(null);
      return;
    }
    if (task) {
      setWorkingTask(task);
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

  const watchedCompleted = Form.useWatch('completedQuantity', form);
  const assignedQuantity = Math.round(workingTask?.quantity ?? 0);
  const completedQuantity = Math.round(watchedCompleted ?? 0);
  const remainderQuantity = computeAcceptedRemainderQuantity(assignedQuantity, completedQuantity);
  const showRemainderAction = Boolean(
    workingTask && canSpawnEvaluationRemainder(workingTask, completedQuantity) && !remainderLink,
  );

  const remainderSummary = useMemo(() => {
    if (assignedQuantity <= 0) return null;
    return `Đạt ${Math.min(Math.max(0, completedQuantity), assignedQuantity)} / ${assignedQuantity}${
      remainderQuantity > 0 ? ` · Còn ${remainderQuantity}` : ''
    }`;
  }, [assignedQuantity, completedQuantity, remainderQuantity]);

  const handleClose = () => {
    form.resetFields();
    setRemainderLink(null);
    setWorkingTask(null);
    onClose();
  };

  const handleValuesChange = (changed: Partial<EvaluateTaskFormValues>) => {
    if (!('completedQuantity' in changed) || !workingTask) return;
    const assigned = Math.round(workingTask.quantity ?? 0);
    if (assigned <= 0) return;
    const nextCompleted = Math.min(
      Math.max(0, Math.round(changed.completedQuantity ?? 0)),
      assigned,
    );
    if (nextCompleted !== changed.completedQuantity) {
      form.setFieldValue('completedQuantity', nextCompleted);
    }
    form.setFieldValue(
      'completionPercent',
      computeCompletionPercentFromQuantity(nextCompleted, assigned),
    );
  };

  const handleSpawnRemainder = () => {
    if (!workingTask) return;
    const accepted = Math.round(form.getFieldValue('completedQuantity') ?? 0);
    if (!canSpawnEvaluationRemainder(workingTask, accepted)) return;

    spawnRemainder(
      { id: workingTask.id, payload: { acceptedQuantity: accepted } },
      {
        onSuccess: (result) => {
          setWorkingTask(result.sourceTask);
          setRemainderLink({
            id: result.remainderTask.id,
            taskName: result.remainderTask.taskName,
            taskCode: result.remainderTask.taskCode,
          });
          form.setFieldsValue({
            completedQuantity: accepted,
            completionPercent: computeCompletionPercentFromQuantity(
              accepted,
              Math.round(result.sourceTask.quantity),
            ),
          });
        },
      },
    );
  };

  const handleFinish = (values: EvaluateTaskFormValues) => {
    if (!workingTask) return;

    mutate(
      {
        id: workingTask.id,
        payload: {
          completionPercent: values.completionPercent,
          pmEvaluation: values.pmEvaluation ?? '',
          pmNote: values.pmNote ?? '',
        },
      },
      {
        onSuccess: () => {
          form.resetFields();
          setRemainderLink(null);
          setWorkingTask(null);
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
      okButtonProps={{ disabled: isSpawning }}
    >
      {workingTask ? (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectName}</span>
            <span className={styles.contextValue}>{workingTask.projectName}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.taskName}</span>
            <span className={styles.contextValue}>{workingTask.taskName}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.staffName}</span>
            <span className={styles.contextValue}>
              {formatTaskStaffNames(workingTask.staff, '—')}
            </span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{EVALUATE_TASK_ASSIGNED_QUANTITY_LABEL}</span>
            <span className={styles.contextValue}>{assignedQuantity}</span>
          </div>
          {remainderSummary ? (
            <div className={styles.contextItem}>
              <span className={styles.readOnlyLabel}>Tóm tắt</span>
              <span className={styles.contextValue}>{remainderSummary}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        requiredMark={false}
        disabled={isPending || isSpawning}
      >
        <div className={styles.row}>
          <Form.Item
            name="completedQuantity"
            label={EVALUATE_TASK_COMPLETED_QUANTITY_LABEL}
            rules={[
              { required: true, message: 'Nhập số lượng đạt' },
              {
                type: 'integer',
                message: 'Số lượng phải là số nguyên',
              },
            ]}
            extra={assignedQuantity > 0 ? `Tối đa ${assignedQuantity}` : undefined}
          >
            <InputNumber
              min={0}
              max={assignedQuantity > 0 ? assignedQuantity : undefined}
              precision={0}
              step={1}
              style={{ width: '100%' }}
            />
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

      {showRemainderAction ? (
        <div className={styles.section}>
          <p className={styles.readOnlyLabel}>{EVALUATE_TASK_REMAINDER_HINT}</p>
          <Button
            type="default"
            block
            loading={isSpawning}
            disabled={isPending}
            onClick={handleSpawnRemainder}
            style={{ marginTop: 8 }}
          >
            {EVALUATE_TASK_REMAINDER_BUTTON} ({remainderQuantity})
          </Button>
        </div>
      ) : null}

      {remainderLink ? (
        <div className={styles.section}>
          <span className={styles.readOnlyLabel}>Task phần còn lại</span>
          <a
            href={buildMyTaskDetailPath(remainderLink.id)}
            target="_blank"
            rel="noreferrer"
            className={styles.contextValue}
          >
            {remainderLink.taskCode}: {remainderLink.taskName}
          </a>
        </div>
      ) : null}
    </Modal>
  );
}
