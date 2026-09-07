import { useEffect } from 'react';
import { Alert, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { DATE_FORMAT, DATETIME_FORMAT } from '@/config/constants';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import { CONFIRMATION_LABELS } from '../../constants';
import { useCreateTaskRevision } from '../../hooks/useCreateTaskRevision';
import {
  CLASSIFICATION_LEVELS,
  type CreateRevisionRequest,
  type MyTask,
} from '../../schemas/task.schema';
import { formatTaskStaffNames } from '../../utils/staff';
import {
  defaultTaskDeadline,
  formatTaskDateTime,
  fromTaskDeadline,
  toTaskDateOnly,
  toTaskDeadline,
} from '../../utils/taskDates';
import {
  formatTaskCodeShort,
  getTaskDeadline,
  TASK_CATEGORY_DEPARTMENT_LABELS,
} from '../../utils/taskDetail';
import {
  formatRevisionLabel,
  formatRevisionQuantityExtra,
  getNextRevisionRound,
  REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE,
  revisionQuantityExpandedCapacityHint,
} from '../../utils/taskRevision';
import editStyles from '../EditTaskModal/EditTaskModal.module.scss';
import styles from './RequestRevisionDrawer.module.scss';

interface RequestRevisionDrawerProps {
  open: boolean;
  task: MyTask | null;
  revisionChildren: MyTask[];
  onClose: () => void;
}

type FormValues = {
  revisionReason: string;
  quantity: number;
  level: number;
  date: Dayjs;
  deadline: Dayjs;
};

function formatDepartment(task: MyTask): string {
  if (task.department) return getDepartmentLabel(task.department);
  return TASK_CATEGORY_DEPARTMENT_LABELS[task.taskCategory];
}

function truncateBrief(value: string, max = 140): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Chưa có mô tả';
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trimEnd()}…`;
}

function defaultResubmissionDeadline(task: MyTask, workDate: Dayjs = dayjs()): Dayjs {
  const parentDeadline = fromTaskDeadline(getTaskDeadline(task));
  let deadline = parentDeadline.isValid()
    ? parentDeadline.add(1, 'day').second(0).millisecond(0)
    : defaultTaskDeadline().add(1, 'day');
  if (deadline.isBefore(workDate, 'day')) {
    deadline = workDate.hour(deadline.hour()).minute(deadline.minute()).second(0).millisecond(0);
  }
  return deadline;
}

export function RequestRevisionDrawer({
  open,
  task,
  revisionChildren,
  onClose,
}: RequestRevisionDrawerProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate, isPending } = useCreateTaskRevision();
  const watchedQuantity = Form.useWatch('quantity', form);

  useEffect(() => {
    if (!open || !task) return;
    const workDate = dayjs();
    form.setFieldsValue({
      revisionReason: '',
      quantity: task.quantity,
      level: Math.min(4, Math.max(1, Math.round(task.level))),
      date: workDate,
      deadline: defaultResubmissionDeadline(task, workDate),
    });
  }, [open, task, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    if (!task) return;

    const payload: CreateRevisionRequest = {
      revisionReason: values.revisionReason.trim(),
      quantity: values.quantity,
      level: values.level,
      date: toTaskDateOnly(values.date),
      deadline: toTaskDeadline(values.deadline),
    };

    mutate(
      { id: task.id, payload },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };

  const nextRound = task ? getNextRevisionRound(task.id, revisionChildren) : 1;
  const expandedHint =
    task != null && typeof watchedQuantity === 'number'
      ? revisionQuantityExpandedCapacityHint(watchedQuantity, task.quantity)
      : null;

  return (
    <Modal
      title={`Yêu cầu ${formatRevisionLabel({ revisionRound: nextRound })}`}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Tạo revision"
      confirmLoading={isPending}
      destroyOnHidden
      width={560}
    >
      {task ? (
        <>
          <div className={editStyles.contextCard}>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Mã task</span>
              <div className={editStyles.contextValue} title={task.taskCode}>
                {formatTaskCodeShort(task.taskCode)}
              </div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Loại task</span>
              <div className={editStyles.contextValue}>{task.taskName || '—'}</div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Project</span>
              <div className={editStyles.contextValue} title={task.projectName}>
                {task.projectName || '—'}
              </div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Phòng ban</span>
              <div className={editStyles.contextValue}>{formatDepartment(task) || '—'}</div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Người nhận</span>
              <div className={editStyles.contextValue}>{formatTaskStaffNames(task.staff, '—')}</div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Trạng thái</span>
              <div className={editStyles.contextValue}>
                {CONFIRMATION_LABELS[task.staffConfirmation]}
              </div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Số lượng gốc</span>
              <div className={editStyles.contextValue}>{task.quantity}</div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Level gốc</span>
              <div className={editStyles.contextValue}>Level {Math.round(task.level)}</div>
            </div>
            <div className={editStyles.contextItem}>
              <span className={editStyles.readOnlyLabel}>Deadline gốc</span>
              <div className={editStyles.contextValue}>
                {formatTaskDateTime(getTaskDeadline(task))}
              </div>
            </div>
            <div className={`${editStyles.contextItem} ${styles.briefItem}`}>
              <span className={editStyles.readOnlyLabel}>Mô tả task</span>
              <div className={styles.briefValue} title={task.description.trim() || undefined}>
                {truncateBrief(task.description)}
              </div>
            </div>
          </div>

          <Alert
            type="info"
            showIcon
            className={styles.alert}
            message="Revision gắn với task này"
            description="Người nhận giữ nguyên. Chưa hỗ trợ giao cho người khác. Số lượng làm lại có thể ít hơn hoặc nhiều hơn gốc. Workload tính theo số lượng revision."
          />

          {expandedHint ? (
            <Alert
              type="warning"
              showIcon
              className={styles.alert}
              message="Số lượng lớn hơn task gốc"
              description={expandedHint}
            />
          ) : null}

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleFinish}
            disabled={isPending}
          >
            <Form.Item
              name="revisionReason"
              label="Lý do revision"
              rules={[{ required: true, message: 'Nhập lý do revision' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Mô tả phần cần sửa hoặc feedback từ client"
                maxLength={2000}
                showCount
              />
            </Form.Item>

            <div className={editStyles.row}>
              <Form.Item
                name="quantity"
                label="Số lượng làm lại"
                rules={[
                  { required: true, message: 'Nhập số lượng' },
                  {
                    validator: async (_, value: unknown) => {
                      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
                        throw new Error('Số lượng phải lớn hơn 0');
                      }
                    },
                  },
                ]}
                extra={formatRevisionQuantityExtra(task.quantity)}
              >
                <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="level"
                label="Level revision"
                rules={[{ required: true, message: 'Chọn level' }]}
                extra={`Gốc: Level ${Math.round(task.level)}`}
              >
                <Select
                  options={CLASSIFICATION_LEVELS.map((level) => ({
                    value: level,
                    label: `Level ${level}`,
                  }))}
                />
              </Form.Item>
            </div>

            <div className={editStyles.row}>
              <Form.Item
                name="date"
                label="Ngày tính workload"
                rules={[{ required: true, message: 'Chọn ngày' }]}
                extra="Độc lập với ngày của task gốc."
              >
                <DatePicker
                  format={DATE_FORMAT}
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    if (value) {
                      const deadline = form.getFieldValue('deadline') as Dayjs | undefined;
                      if (deadline?.isBefore(value, 'day')) {
                        form.setFieldValue(
                          'deadline',
                          value
                            .hour(deadline.hour())
                            .minute(deadline.minute())
                            .second(0)
                            .millisecond(0),
                        );
                      }
                    }
                    void form.validateFields(['deadline']);
                  }}
                />
              </Form.Item>

              <Form.Item
                name="deadline"
                label="Deadline nộp lại"
                dependencies={['date']}
                rules={[
                  { required: true, message: 'Chọn deadline' },
                  ({ getFieldValue }) => ({
                    validator: async (_, value: Dayjs | undefined) => {
                      const workDate = getFieldValue('date') as Dayjs | undefined;
                      if (!value || !workDate) return;
                      if (value.isBefore(workDate, 'day')) {
                        throw new Error(REVISION_DEADLINE_BEFORE_WORK_DATE_MESSAGE);
                      }
                    },
                  }),
                ]}
                extra={`Gốc: ${formatTaskDateTime(getTaskDeadline(task))}`}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format={DATETIME_FORMAT}
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    const workDate = form.getFieldValue('date') as Dayjs | undefined;
                    if (!current || !workDate) return false;
                    return current.isBefore(workDate, 'day');
                  }}
                />
              </Form.Item>
            </div>
          </Form>
        </>
      ) : null}
    </Modal>
  );
}
