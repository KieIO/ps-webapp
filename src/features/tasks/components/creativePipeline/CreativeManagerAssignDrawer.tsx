import {
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
  const [briefExpanded, setBriefExpanded] = useState(false);
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
  const briefText = task?.description?.trim() || 'Chưa có mô tả';
  const briefLong = briefText.length > 140 || briefText.includes('\n');
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
    setBriefExpanded(false);
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
    setBriefExpanded(false);
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
      className={styles.assignDrawer}
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
            <p className={`${styles.contextMeta} ${styles.metaInline}`}>
              <span>
                {task.projectName}
                {task.projectManager.name ? ` · PM: ${task.projectManager.name}` : ''}
                {` · CM: ${creativeManagerName}`}
              </span>
              {urgencyDisplay ? <ProjectUrgencyBadge urgency={urgencyDisplay} /> : null}
            </p>
            <div className={styles.factsRow}>
              <div className={styles.fact}>
                <span className={styles.factLabel}>SL hiện tại</span>
                <span className={styles.factValue}>
                  {task.quantity > 0 ? task.quantity : '—'}
                  <span className={styles.factValueMuted}> · CM xác nhận khi giao</span>
                </span>
              </div>{' '}
              <div className={styles.fact}>
                <span className={styles.factLabel}>Deadline PM</span>
                <span className={styles.factValue}>{pmDeadlineLabel}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Creative DL</span>
                <span className={styles.factValue}>{creativeDeadlineLabel}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Level</span>
                <span className={styles.factValue}>
                  {task.level}
                  <span className={styles.factValueMuted}>
                    {` · TD ${task.designThinking} · KT ${task.technical} · NL ${task.contentProcessing}`}
                  </span>
                </span>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <p
                className={`${styles.briefClamp} ${briefExpanded ? styles.briefClampExpanded : ''}`}
              >
                {briefText}
              </p>
              {briefLong ? (
                <Button
                  type="link"
                  className={styles.briefToggle}
                  onClick={() => setBriefExpanded((prev) => !prev)}
                >
                  {briefExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Button>
              ) : null}
              {task.additionalFactors?.trim() ? (
                <p className={styles.contextMeta} style={{ marginTop: 4 }}>
                  Yếu tố bổ sung: {task.additionalFactors.trim()}
                </p>
              ) : null}
            </div>

            {chNote ? (
              <p className={styles.chNoteLine}>
                <strong>CH note:</strong> {chNote}
              </p>
            ) : null}
          </div>

          {canSubmit ? (
            <div className={styles.formSection}>
              <p className={styles.sectionLabel}>Hình thức giao</p>
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

              <Form form={form} layout="vertical" size="small" className={styles.editForm}>
                {mode === 'whole' ? (
                  <div className={styles.formSectionStack}>
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
                      extra={
                        task.quantity > 0
                          ? `SL hiện tại trên task (PM/Admin lúc tạo): ${task.quantity}. CM nhập SL chính thức khi giao.`
                          : 'CM nhập số lượng khi giao Staff.'
                      }
                    >
                      <InputNumber
                        min={0.01}
                        step={1}
                        style={{ width: '100%' }}
                        placeholder={task.quantity > 0 ? `VD: ${task.quantity}` : 'VD: 24'}
                      />
                    </Form.Item>{' '}
                    <Form.Item
                      name="staffUserId"
                      label="Giao cho"
                      rules={[{ required: true, message: 'Chọn Staff nhận task' }]}
                      extra={
                        <>
                          Có thể chọn chính mình nếu CM tự thực thi. {periodNote}
                          {capacityLoading ? ' · Đang tải capacity…' : null}
                          {capacityError ? ' · Dùng ước lượng tạm.' : null}
                        </>
                      }
                    >
                      {renderStaffSelect(false)}
                    </Form.Item>
                    <Form.Item
                      name="creativeDeadline"
                      label="Creative deadline"
                      extra="Bỏ trống = giữ deadline hiện có."
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
                ) : (
                  <div className={styles.formSectionStack}>
                    <div className={styles.splitSummary}>
                      <span className={styles.splitSummaryTotal}>
                        {splitLockedTotal > 0
                          ? `SL tổng sẽ khoá: ${splitLockedTotal}`
                          : 'SL tổng sẽ khoá khi nhập đủ các phần'}
                      </span>
                      <span className={styles.splitSummaryHint}>
                        {task.quantity > 0
                          ? `SL hiện tại: ${task.quantity}. Cộng SL từng phần = tổng khoá.`
                          : 'Cộng SL từng phần = tổng khoá sau khi giao.'}
                      </span>{' '}
                    </div>{' '}
                    <Form.List name="subtasks">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <div className={styles.subtaskCardCompact} key={field.key}>
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
                  </div>
                )}
              </Form>
            </div>
          ) : (
            <CreativeAssignModeSection task={task} allTasks={allTasks} />
          )}
        </div>
      ) : null}
    </Drawer>
  );
}
