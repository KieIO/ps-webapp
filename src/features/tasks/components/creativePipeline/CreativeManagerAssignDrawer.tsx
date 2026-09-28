import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Segmented,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useAssignCreativeManager } from '../../hooks/useAssignCreativeManager';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import type { CreativeAssignMode, MyTask } from '../../schemas/task.schema';
import {
  canCmRefuseCreativeAssignment,
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeAssignableExecutors,
  getAssigneeWorkload,
  isAwaitingCm,
  resolveAssigneeAvailability,
} from '../../utils/creativePipeline';
import { fromTaskDeadline, formatTaskDateTime, toTaskDeadline } from '../../utils/taskDates';
import { getTaskDeadline } from '../../utils/taskDetail';
import { resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import { AssigneeOptionLabel } from './AssigneeOptionLabel';
import { CreativeAssignModeSection } from './CreativeAssignModeSection';
import styles from './creativePipeline.module.scss';

interface CreativeManagerAssignDrawerProps {
  open: boolean;
  task: MyTask | null;
  readOnly?: boolean;
  onClose: () => void;
}

type SubtaskForm = {
  name?: string;
  staffUserId?: string;
  quantity?: number;
  description?: string;
  creativeDeadline?: dayjs.Dayjs | null;
};

type ManagerFormValues = {
  staffUserId?: string;
  quantity?: number;
  creativeDeadline?: dayjs.Dayjs | null;
  subtasks?: SubtaskForm[];
};

const emptySubtask = (): SubtaskForm => ({
  name: '',
  staffUserId: undefined,
  quantity: undefined,
  description: '',
  creativeDeadline: undefined,
});

const resolveCreativeDeadlineLabel = (task: MyTask): string => {
  const source = task.creativeDeadline ?? getTaskDeadline(task);
  return source ? formatTaskDateTime(source) : '—';
};

/** CH note is stored as staffNote on live API until CM reassigns staff. */
const resolveChNote = (task: MyTask): string => {
  const fromCmNote = task.cmNote?.trim();
  if (fromCmNote) return fromCmNote;
  if (isAwaitingCm(task)) return task.staffNote?.trim() ?? '';
  return '';
};

export function CreativeManagerAssignDrawer({
  open,
  task,
  readOnly = false,
  onClose,
}: CreativeManagerAssignDrawerProps) {
  const [form] = Form.useForm<ManagerFormValues>();
  const [mode, setMode] = useState<CreativeAssignMode>('whole');
  const currentUser = useAppSelector((state) => state.auth.user);
  const { mutate, isPending } = useAssignCreativeManager();
  const { mutate: updateStatus, isPending: isRefusing } = useUpdateMyTaskStatus();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const watchedCreativeDeadline = Form.useWatch('creativeDeadline', form);
  const watchedSubtasks = Form.useWatch('subtasks', form) as SubtaskForm[] | undefined;
  const capacityDeadlineOverride = useMemo(() => {
    if (mode === 'whole') {
      return watchedCreativeDeadline?.isValid() ? toTaskDeadline(watchedCreativeDeadline) : null;
    }
    const isos = (watchedSubtasks ?? [])
      .map((row) => (row.creativeDeadline?.isValid() ? toTaskDeadline(row.creativeDeadline) : null))
      .filter((value): value is string => Boolean(value));
    if (isos.length === 0) return null;
    return [...isos].sort()[0];
  }, [mode, watchedCreativeDeadline, watchedSubtasks]);
  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
    isError: capacityError,
  } = useAssignPickerCapacity(task, open, capacityDeadlineOverride);
  const canSubmit = Boolean(task && !readOnly && isAwaitingCm(task));
  const canRefuse = Boolean(
    task && !readOnly && canCmRefuseCreativeAssignment(task, currentUser?.id, currentUser?.role),
  );
  const busy = isPending || isRefusing;
  const chNote = task ? resolveChNote(task) : '';
  const creativeManagerName = currentUser?.name?.trim() || '—';
  const urgencyDisplay = task ? resolveTaskUrgencyDisplay(task) : null;
  const pmDeadlineLabel = task ? formatTaskDateTime(getTaskDeadline(task)) : '—';
  const creativeDeadlineLabel = task ? resolveCreativeDeadlineLabel(task) : '—';
  const splitLockedTotal = useMemo(
    () =>
      (watchedSubtasks ?? []).reduce((sum, row) => {
        const qty = Number(row?.quantity);
        return Number.isFinite(qty) && qty > 0 ? sum + qty : sum;
      }, 0),
    [watchedSubtasks],
  );

  const staffSelectOptions = useMemo(
    () =>
      filterCreativeAssignableExecutors(staffOptions, currentUser?.role, currentUser?.id).map(
        (staff) => {
          const workload = getAssigneeWorkload(allTasks, staff.userId ?? undefined);
          return {
            value: staff.userId ?? staff.code,
            label: staff.name,
            disabled: !canSelectAssignee(staff, allTasks, capacityByUserId),
            staff,
            activeCount: workload.activeCount,
            capacityPercent: displayCapacityPercent(staff, allTasks, capacityByUserId),
            availability: resolveAssigneeAvailability(staff, capacityByUserId),
          };
        },
      ),
    [staffOptions, allTasks, capacityByUserId, currentUser?.role, currentUser?.id],
  );

  useEffect(() => {
    if (!open || !task) return;
    setMode('whole');
    const defaultCreative = task.creativeDeadline
      ? fromTaskDeadline(task.creativeDeadline)
      : undefined;
    form.setFieldsValue({
      staffUserId: undefined,
      // CM owns quantity — do not prefill placeholder from create-time default.
      quantity: undefined,
      creativeDeadline: defaultCreative,
      subtasks: [emptySubtask(), emptySubtask()].map((row) => ({
        ...row,
        creativeDeadline: defaultCreative,
      })),
    });
  }, [open, task, form]);

  const resetAndClose = () => {
    form.resetFields();
    setMode('whole');
    onClose();
  };

  const handleCloseRequest = () => {
    if (busy) return;
    if (!readOnly && form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy giao task?',
        content: 'Thông tin đã nhập sẽ không được lưu.',
        okText: 'Hủy',
        cancelText: 'Tiếp tục',
        okButtonProps: { danger: true },
        onOk: resetAndClose,
      });
      return;
    }
    resetAndClose();
  };

  const handleRefuse = () => {
    if (!task) return;
    Modal.confirm({
      title: 'Từ chối nhận task này?',
      content: 'Task sẽ trả về hàng chờ Creative Head để giao lại CM.',
      okText: 'Từ chối',
      okButtonProps: { danger: true },
      cancelText: 'Quay lại',
      centered: true,
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          updateStatus(
            {
              id: task.id,
              staffConfirmation: 'decline',
              staffNote: task.staffNote ?? '',
            },
            {
              onSuccess: () => {
                resetAndClose();
                resolve();
              },
              onError: (error) => reject(error),
            },
          );
        }),
    });
  };

  const handleSubmit = async () => {
    if (!task) return;
    const values = await form.validateFields(
      mode === 'whole' ? ['staffUserId', 'quantity', 'creativeDeadline'] : ['subtasks'],
    );
    mutate(
      {
        id: task.id,
        payload:
          mode === 'whole'
            ? {
                mode,
                staffUserId: values.staffUserId,
                quantity: values.quantity,
                creativeDeadline: values.creativeDeadline?.isValid()
                  ? toTaskDeadline(values.creativeDeadline)
                  : undefined,
              }
            : {
                mode,
                subtasks: (values.subtasks ?? []).map((subtask) => ({
                  name: (subtask.name ?? '').trim(),
                  staffUserId: subtask.staffUserId ?? '',
                  quantity: subtask.quantity ?? 0,
                  description: (subtask.description ?? '').trim(),
                  creativeDeadline: subtask.creativeDeadline?.isValid()
                    ? toTaskDeadline(subtask.creativeDeadline)
                    : undefined,
                })),
              },
      },
      { onSuccess: resetAndClose },
    );
  };

  const renderStaffSelect = (disabled: boolean) => (
    <Select
      showSearch
      optionFilterProp="label"
      disabled={disabled}
      placeholder="Chọn Staff"
      options={staffSelectOptions}
      optionRender={(option) => {
        const data = option.data as {
          staff: (typeof staffSelectOptions)[number]['staff'];
          activeCount: number;
          capacityPercent: number;
          availability: (typeof staffSelectOptions)[number]['availability'];
        };
        return (
          <AssigneeOptionLabel
            staff={data.staff}
            activeCount={data.activeCount}
            capacityPercent={data.capacityPercent}
            availability={data.availability}
          />
        );
      }}
    />
  );

  return (
    <Drawer
      title="Giao task cho Staff"
      open={open}
      onClose={handleCloseRequest}
      width={520}
      destroyOnHidden
      maskClosable={!busy}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCloseRequest} disabled={busy}>
            {canSubmit ? 'Hủy' : 'Đóng'}
          </Button>
          {canRefuse ? (
            <Button danger loading={isRefusing} disabled={busy} onClick={handleRefuse}>
              Từ chối nhận
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              type="primary"
              loading={isPending}
              disabled={busy}
              onClick={() => void handleSubmit()}
            >
              {mode === 'split' ? 'Giao tất cả task nhỏ' : 'Giao nguyên task'}
            </Button>
          ) : null}
        </div>
      }
    >
      {task ? (
        <div className={styles.root}>
          <div className={styles.contextCard}>
            <p className={styles.contextTitle}>
              {task.taskCode}: {task.taskName}
            </p>
            <p className={styles.contextMeta}>
              {task.projectName}
              {task.projectManager.name ? ` · PM: ${task.projectManager.name}` : ''}
              {` · CM: ${creativeManagerName}`}
            </p>
            <p className={`${styles.contextMeta} ${styles.metaInline}`}>
              Deadline gốc: {pmDeadlineLabel}
              {' · '}
              Creative: {creativeDeadlineLabel}
              {urgencyDisplay ? (
                <>
                  {' · '}
                  <ProjectUrgencyBadge urgency={urgencyDisplay} />
                </>
              ) : null}
            </p>
          </div>

          <div className={styles.contextCard}>
            <div className={styles.briefBlock}>{task.description?.trim() || 'Chưa có mô tả'}</div>
            <p className={styles.contextMeta}>
              Level {task.level} · TD {task.designThinking} · KT {task.technical} · NL{' '}
              {task.contentProcessing}
              {task.additionalFactors?.trim() ? ` · ${task.additionalFactors.trim()}` : ''}
            </p>
          </div>

          {chNote ? <Alert type="info" showIcon message={`Ghi chú từ CH: ${chNote}`} /> : null}

          {canSubmit ? (
            <>
              <Segmented
                className={styles.modeToggle}
                block
                size="small"
                value={mode}
                onChange={(value) => setMode(value as CreativeAssignMode)}
                options={[
                  { label: 'Giao nguyên', value: 'whole' },
                  { label: 'Chia nhỏ', value: 'split' },
                ]}
              />

              <Form form={form} layout="vertical" size="small">
                {mode === 'whole' ? (
                  <>
                    <Form.Item
                      name="quantity"
                      label="Số lượng"
                      rules={[
                        { required: true, message: 'CM nhập số lượng trước khi giao' },
                        {
                          type: 'number',
                          min: 0.01,
                          message: 'Số lượng phải lớn hơn 0',
                        },
                      ]}
                      extra="Task Creative: CM điền số lượng khi giao Staff."
                    >
                      <InputNumber
                        min={0.01}
                        step={1}
                        style={{ width: '100%' }}
                        placeholder="VD: 24"
                      />
                    </Form.Item>
                    <Form.Item
                      name="staffUserId"
                      label="Giao cho"
                      rules={[{ required: true, message: 'Chọn Staff nhận task' }]}
                      extra="Có thể chọn chính mình nếu CM tự thực thi."
                    >
                      {renderStaffSelect(false)}
                    </Form.Item>
                    <Form.Item
                      name="creativeDeadline"
                      label="Creative deadline"
                      extra="Deadline nội bộ do CM quyết. Bỏ trống = giữ / fallback deadline hiện có."
                    >
                      <DatePicker
                        showTime={{
                          format: 'HH:mm',
                          defaultValue: dayjs().second(0).millisecond(0),
                        }}
                        format={DATETIME_SHORT_FORMAT}
                        style={{ width: '100%' }}
                        allowClear
                        showNow={false}
                      />
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      className={styles.banner}
                      message={`SL tổng sẽ khoá: ${splitLockedTotal || '—'}`}
                      description="Sau khi chia, tổng này cố định. Chỉnh từng task nhỏ sau vẫn phải khớp tổng."
                    />
                    <Form.List name="subtasks">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div className={styles.subtaskCard} key={field.key}>
                              <div className={styles.subtaskHeader}>
                                <span>Task nhỏ {index + 1}</span>
                                {fields.length > 2 ? (
                                  <Button type="link" danger onClick={() => remove(field.name)}>
                                    Xóa
                                  </Button>
                                ) : null}
                              </div>
                              <Form.Item
                                name={[field.name, 'name']}
                                label="Tên"
                                rules={[{ required: true, message: 'Nhập tên task nhỏ' }]}
                              >
                                <Input placeholder={`${task.taskName} - phần ${index + 1}`} />
                              </Form.Item>
                              <Form.Item
                                name={[field.name, 'description']}
                                label="Brief"
                                rules={[{ required: true, message: 'Nhập brief cho task nhỏ' }]}
                              >
                                <Input.TextArea
                                  rows={2}
                                  placeholder="Mô tả phần việc giao cho Staff..."
                                />
                              </Form.Item>
                              <div className={styles.deadlineRow}>
                                <Form.Item
                                  name={[field.name, 'staffUserId']}
                                  label="Giao cho"
                                  rules={[{ required: true, message: 'Chọn Staff' }]}
                                >
                                  {renderStaffSelect(false)}
                                </Form.Item>
                                <Form.Item
                                  name={[field.name, 'quantity']}
                                  label="Số lượng"
                                  rules={[
                                    { required: true, message: 'Nhập số lượng' },
                                    {
                                      type: 'number',
                                      min: 0.01,
                                      message: 'Số lượng phải lớn hơn 0',
                                    },
                                  ]}
                                >
                                  <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
                                </Form.Item>
                              </div>
                              <Form.Item
                                name={[field.name, 'creativeDeadline']}
                                label="Creative deadline"
                                extra="Deadline nội bộ phần này (CM)."
                              >
                                <DatePicker
                                  showTime={{
                                    format: 'HH:mm',
                                    defaultValue: dayjs().second(0).millisecond(0),
                                  }}
                                  format={DATETIME_SHORT_FORMAT}
                                  style={{ width: '100%' }}
                                  allowClear
                                  showNow={false}
                                />
                              </Form.Item>
                            </div>
                          ))}
                          <Button className={styles.addSubtask} onClick={() => add(emptySubtask())}>
                            + Thêm task nhỏ
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                )}
              </Form>
            </>
          ) : (
            <CreativeAssignModeSection task={task} allTasks={allTasks} />
          )}

          <div className={styles.workload}>
            <p className={styles.workloadTitle}>Workload · {periodNote}</p>
            {staffSelectOptions.map((option) => (
              <div
                key={option.value}
                className={`${styles.workloadRow} ${option.disabled ? styles.workloadMuted : ''}`}
              >
                <span>{option.staff.name}</span>
                <span>{option.activeCount}</span>
                <span>{option.capacityPercent}%</span>
              </div>
            ))}
            <p className={styles.note}>
              Có thể giao khi Overloaded; capacity hiển thị theo thực tế (có thể &gt; 100%).
              {capacityLoading ? ' Đang tải…' : null}
              {capacityError ? ' Dùng ước lượng tạm.' : null}
            </p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
