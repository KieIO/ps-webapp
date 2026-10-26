import { ArrowRightOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Segmented, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
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
  buildEvaluationRemainderAutoNote,
  canSpawnEvaluationRemainder,
  computeAcceptedRemainderQuantity,
} from '../../utils/evaluationRemainder';
import { formatTaskStaffNames } from '../../utils/staff';
import { isCreativeWholeAssigned, type EvaluationWriteLayer } from '../../utils/taskEvaluation';
import editStyles from '../EditTaskModal/EditTaskModal.module.scss';
import styles from './EvaluateTaskModal.module.scss';

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
  quantity: number;
};

export function EvaluateTaskModal({ open, task, onClose }: EvaluateTaskModalProps) {
  const [form] = Form.useForm<EvaluateTaskFormValues>();
  const role = useAppSelector((state) => state.auth.user?.role);
  const { mutate, isPending } = useUpdateMyTaskPmEvaluation();
  const { mutate: spawnRemainder, isPending: isSpawning } = useSpawnEvaluationRemainder();
  const [workingTask, setWorkingTask] = useState<MyTask | null>(task);
  const [remainderLink, setRemainderLink] = useState<RemainderLink | null>(null);
  /** SL giao lúc mở modal — giữ sau spawn để UI không nhảy theo quantity đã thu nhỏ. */
  const [originalAssignedQuantity, setOriginalAssignedQuantity] = useState(0);
  const [acceptedAtSpawn, setAcceptedAtSpawn] = useState<number | null>(null);
  const [adminLayer, setAdminLayer] = useState<EvaluationWriteLayer>('handoff');
  const wholeAssigned = Boolean(task && isCreativeWholeAssigned(task));
  const lockedLayer: EvaluationWriteLayer | null = !wholeAssigned
    ? 'staff'
    : role === ROLES.CREATIVE_MANAGER
      ? 'staff'
      : role === ROLES.ADMIN
        ? null
        : 'handoff';
  const layer = lockedLayer ?? adminLayer;

  useEffect(() => {
    if (!open) {
      setRemainderLink(null);
      setWorkingTask(null);
      setOriginalAssignedQuantity(0);
      setAcceptedAtSpawn(null);
      return;
    }
    // After spawn in this session, ignore prop refreshes that would wipe accepted qty.
    if (task && !remainderLink) {
      setWorkingTask(task);
      const originalAssigned =
        task.originalAssignedQuantity != null
          ? Math.round(task.originalAssignedQuantity)
          : Math.round(task.quantity ?? 0);
      setOriginalAssignedQuantity(originalAssigned);

      if (layer === 'handoff') {
        form.setFieldsValue({
          completedQuantity: 0,
          completionPercent: task.handoffCompletionPercent ?? 0,
          pmEvaluation: task.handoffEvaluation ?? '',
          pmNote: task.handoffNote ?? '',
        });
        return;
      }

      if (task.evaluationRemainderTaskId && task.evaluationRemainderTaskCode) {
        const accepted = Math.round(task.quantity ?? 0);
        setAcceptedAtSpawn(accepted);
        setRemainderLink({
          id: task.evaluationRemainderTaskId,
          taskName: task.taskName,
          taskCode: task.evaluationRemainderTaskCode,
          quantity: Math.round(task.evaluationRemainderQuantity ?? 0),
        });
        form.setFieldsValue({
          completedQuantity: accepted,
          completionPercent: computeCompletionPercentFromQuantity(accepted, originalAssigned),
          pmEvaluation: task.pmEvaluation,
          pmNote: task.pmNote,
        });
        return;
      }

      form.setFieldsValue({
        completedQuantity: deriveCompletedQuantityFromPercent(
          task.completionPercent,
          originalAssigned,
        ),
        completionPercent: task.completionPercent ?? 0,
        pmEvaluation: task.pmEvaluation,
        pmNote: task.pmNote,
      });
    }
  }, [open, task, form, remainderLink, layer]);

  const watchedCompleted = Form.useWatch('completedQuantity', form);
  const assignedQuantity = originalAssignedQuantity;
  const completedQuantity = Math.round(
    acceptedAtSpawn != null ? acceptedAtSpawn : (watchedCompleted ?? 0),
  );
  const remainderQuantity = computeAcceptedRemainderQuantity(assignedQuantity, completedQuantity);
  const showRemainderAction = Boolean(
    layer === 'staff' &&
      workingTask &&
      canSpawnEvaluationRemainder(
        { ...workingTask, quantity: assignedQuantity },
        completedQuantity,
      ) &&
      !remainderLink,
  );

  const remainderSummary = useMemo(() => {
    if (assignedQuantity <= 0) return null;
    const achieved = Math.min(Math.max(0, completedQuantity), assignedQuantity);
    if (remainderLink) {
      return `Đạt ${achieved} / ${assignedQuantity} · đã tách ${remainderLink.quantity}`;
    }
    return `Đạt ${achieved} / ${assignedQuantity}${
      remainderQuantity > 0 ? ` · Còn ${remainderQuantity}` : ''
    }`;
  }, [assignedQuantity, completedQuantity, remainderLink, remainderQuantity]);

  const handleClose = () => {
    form.resetFields();
    setRemainderLink(null);
    setWorkingTask(null);
    setOriginalAssignedQuantity(0);
    setAcceptedAtSpawn(null);
    onClose();
  };

  const handleValuesChange = (changed: Partial<EvaluateTaskFormValues>) => {
    if (!('completedQuantity' in changed) || remainderLink) return;
    if (assignedQuantity <= 0) return;
    const nextCompleted = Math.min(
      Math.max(0, Math.round(changed.completedQuantity ?? 0)),
      assignedQuantity,
    );
    if (nextCompleted !== changed.completedQuantity) {
      form.setFieldValue('completedQuantity', nextCompleted);
    }
    form.setFieldValue(
      'completionPercent',
      computeCompletionPercentFromQuantity(nextCompleted, assignedQuantity),
    );
  };

  const handleSpawnRemainder = () => {
    if (!workingTask || assignedQuantity <= 0) return;
    const accepted = Math.round(form.getFieldValue('completedQuantity') ?? 0);
    if (!canSpawnEvaluationRemainder({ ...workingTask, quantity: assignedQuantity }, accepted)) {
      return;
    }

    spawnRemainder(
      { id: workingTask.id, payload: { acceptedQuantity: accepted } },
      {
        onSuccess: (result) => {
          const remainderQty = Math.round(result.remainderTask.quantity ?? 0);
          setWorkingTask(result.sourceTask);
          setAcceptedAtSpawn(accepted);
          setRemainderLink({
            id: result.remainderTask.id,
            taskName: result.remainderTask.taskName,
            taskCode: result.remainderTask.taskCode,
            quantity: remainderQty,
          });
          // Header giữ SL giao gốc; % trên form = phần đã chấp nhận / SL gốc (vd 3/15 → 20%).
          form.setFieldsValue({
            completedQuantity: accepted,
            completionPercent: computeCompletionPercentFromQuantity(accepted, assignedQuantity),
          });
        },
      },
    );
  };

  const handleFinish = (values: EvaluateTaskFormValues) => {
    if (!workingTask) return;

    // Keep % = đạt / SL giao ban đầu (vd 9/12 → 75%), kể cả sau khi đã tách phần còn lại.
    const completionPercent =
      remainderLink && acceptedAtSpawn != null && originalAssignedQuantity > 0
        ? computeCompletionPercentFromQuantity(acceptedAtSpawn, originalAssignedQuantity)
        : (values.completionPercent ?? 0);
    const typedNote = (values.pmNote ?? '').trim();
    let pmNote = values.pmNote ?? '';
    if (!typedNote && remainderLink && acceptedAtSpawn != null && originalAssignedQuantity > 0) {
      pmNote = buildEvaluationRemainderAutoNote({
        acceptedQuantity: acceptedAtSpawn,
        originalAssignedQuantity,
        remainderTaskCode: remainderLink.taskCode,
        remainderQuantity: remainderLink.quantity,
      });
    }

    mutate(
      {
        id: workingTask.id,
        payload: {
          completionPercent,
          pmEvaluation: values.pmEvaluation ?? '',
          pmNote,
          ...(wholeAssigned ? { layer } : {}),
        },
      },
      {
        onSuccess: () => {
          form.resetFields();
          setRemainderLink(null);
          setWorkingTask(null);
          setOriginalAssignedQuantity(0);
          setAcceptedAtSpawn(null);
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title={
        layer === 'handoff'
          ? 'Đánh giá gói của CM'
          : wholeAssigned
            ? 'Đánh giá kết quả Staff'
            : 'Evaluate task'
      }
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
        <div className={editStyles.contextCard}>
          <div className={editStyles.contextItem}>
            <span className={editStyles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectName}</span>
            <span className={editStyles.contextValue}>{workingTask.projectName}</span>
          </div>
          <div className={editStyles.contextItem}>
            <span className={editStyles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.taskName}</span>
            <span className={editStyles.contextValue}>{workingTask.taskName}</span>
          </div>
          <div className={editStyles.contextItem}>
            <span className={editStyles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.staffName}</span>
            <span className={editStyles.contextValue}>
              {formatTaskStaffNames(workingTask.staff, '—')}
            </span>
          </div>
          {layer === 'staff' ? (
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>
                {EVALUATE_TASK_ASSIGNED_QUANTITY_LABEL}
              </span>
              <span className={editStyles.contextValue}>{assignedQuantity}</span>
            </div>
          ) : null}
          {layer === 'staff' && remainderSummary ? (
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Tóm tắt</span>
              <span className={editStyles.contextValue}>{remainderSummary}</span>
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
        {lockedLayer == null ? (
          <Form.Item label="Lớp đánh giá">
            <Segmented
              block
              value={layer}
              onChange={(value) => setAdminLayer(value as EvaluationWriteLayer)}
              options={[
                { label: 'Gói của CM', value: 'handoff' },
                { label: 'Kết quả Staff', value: 'staff' },
              ]}
            />
          </Form.Item>
        ) : null}
        {layer === 'staff' ? (
          <div className={editStyles.row}>
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
              extra={
                assignedQuantity > 0
                  ? remainderLink
                    ? `Đã tách phần còn lại · giữ ${completedQuantity} / ${assignedQuantity}`
                    : `Tối đa ${assignedQuantity}`
                  : undefined
              }
            >
              <InputNumber
                min={0}
                max={assignedQuantity > 0 ? assignedQuantity : undefined}
                precision={0}
                step={1}
                disabled={Boolean(remainderLink) || isPending || isSpawning}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              name="completionPercent"
              label={MY_TASK_COLUMN_HEADERS.completion}
              rules={[{ required: true, message: 'Nhập % hoàn thành' }]}
              extra={
                remainderLink
                  ? 'Theo SL giao ban đầu (đạt / giao) — phần còn lại đã tách sang task mới.'
                  : undefined
              }
            >
              <InputNumber
                min={0}
                max={100}
                precision={0}
                addonAfter="%"
                disabled={Boolean(remainderLink) || isPending || isSpawning}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        ) : (
          <Form.Item
            name="completionPercent"
            label={MY_TASK_COLUMN_HEADERS.completion}
            rules={[{ required: true, message: 'Nhập % hoàn thành' }]}
          >
            <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item name="pmEvaluation" label={MY_TASK_COLUMN_HEADERS.evaluation}>
          <Select allowClear placeholder="—" options={[...PROJECT_EVALUATION_SCORE_OPTIONS]} />
        </Form.Item>
        <Form.Item name="pmNote" label={EVALUATE_TASK_NOTE_LABEL}>
          <Input.TextArea rows={3} placeholder={EVALUATE_TASK_NOTE_PLACEHOLDER} />
        </Form.Item>
      </Form>

      {showRemainderAction ? (
        <div className={styles.remainderPanel}>
          <p className={styles.remainderHint}>{EVALUATE_TASK_REMAINDER_HINT}</p>
          <Button
            type="default"
            block
            loading={isSpawning}
            disabled={isPending}
            onClick={handleSpawnRemainder}
          >
            {EVALUATE_TASK_REMAINDER_BUTTON} ({remainderQuantity})
          </Button>
        </div>
      ) : null}

      {remainderLink ? (
        <div className={styles.remainderPanel}>
          <div className={styles.remainderCard}>
            <div className={styles.remainderCardHeader}>
              <span className={styles.remainderChip}>Đã tạo task còn lại</span>
              <span className={styles.remainderQty}>SL {remainderLink.quantity}</span>
            </div>
            <div className={styles.remainderBody}>
              <p className={styles.remainderCode}>{remainderLink.taskCode}</p>
              <p className={styles.remainderName}>{remainderLink.taskName}</p>
              <p className={styles.remainderMeta}>Cùng task cha · chưa gán Staff</p>
            </div>
            <Link className={styles.remainderLink} to={buildMyTaskDetailPath(remainderLink.id)}>
              Mở chi tiết
              <ArrowRightOutlined className={styles.remainderLinkIcon} />
            </Link>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
