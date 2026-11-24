import { Alert, Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import { useOpenLeavesInRange } from '@/features/leave/hooks/useLeave';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { useAssignCreativeManager } from '../../hooks/useAssignCreativeManager';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateMyTaskStatus } from '../../hooks/useUpdateMyTaskStatus';
import type { MyTask } from '../../schemas/task.schema';
import {
  buildLeaveChipByUserId,
  findLeaveOverlappingWindow,
  formatLeaveRangeLabel,
  SPLIT_ASSIGN_LEAVE_CONFLICT_HINT,
  SPLIT_ASSIGN_LEAVE_CONFLICT_TITLE,
  type LeaveWindowHit,
} from '../../utils/assignLeaveConflict';
import {
  canCmRefuseCreativeAssignment,
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeAssignableExecutors,
  getAssigneeWorkload,
  isAwaitingCm,
  resolveAssigneeAvailability,
} from '../../utils/creativePipeline';
import { openDeclineReasonModal } from '../../utils/declineReasonModal';
import {
  calendarDateFromTaskDeadline,
  formatTaskDateTime,
  fromTaskDeadline,
  isCreativeDeadlineAfterPmDeadline,
  toTaskDateOnly,
  toTaskDeadline,
} from '../../utils/taskDates';
import { getTaskDeadline } from '../../utils/taskDetail';
import { nonNegativeWholeQuantityRule } from '../../utils/taskQuantity';
import { defaultSplitChildName } from '../../utils/taskScoreName';
import { resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import {
  CreativeDeadlineFieldExtra,
  CreativeDeadlineFieldLabel,
} from '../CreativeDeadlineFieldLabel/CreativeDeadlineFieldLabel';
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
  subtasks?: SubtaskForm[];
};

const emptySubtask = (): SubtaskForm => ({
  name: '',
  staffUserId: undefined,
  quantity: 0,
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
  const [briefExpanded, setBriefExpanded] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);
  const { mutate, isPending } = useAssignCreativeManager();
  const { mutate: updateStatus, isPending: isRefusing } = useUpdateMyTaskStatus();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const watchedSubtasks = Form.useWatch('subtasks', form) as SubtaskForm[] | undefined;

  const capacityDeadlineOverride = useMemo(() => {
    const isos = (watchedSubtasks ?? [])
      .map((row) => (row.creativeDeadline?.isValid() ? toTaskDeadline(row.creativeDeadline) : null))
      .filter((value): value is string => Boolean(value));
    if (isos.length === 0) return null;
    return [...isos].sort()[0];
  }, [watchedSubtasks]);

  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
    isError: capacityError,
  } = useAssignPickerCapacity(task, open, capacityDeadlineOverride);

  const assignWindowStart = useMemo(() => toTaskDateOnly(dayjs()), []);
  const assignWindowEnd = useMemo(() => {
    const childEnds = (watchedSubtasks ?? [])
      .map((row) => (row.creativeDeadline?.isValid() ? toTaskDateOnly(row.creativeDeadline) : null))
      .filter((value): value is string => Boolean(value))
      .sort();
    if (childEnds[0]) return childEnds[0];
    if (task?.creativeDeadline) {
      return calendarDateFromTaskDeadline(task.creativeDeadline) ?? assignWindowStart;
    }
    const pmDl = task ? getTaskDeadline(task) : '';
    if (pmDl) {
      return calendarDateFromTaskDeadline(pmDl) ?? assignWindowStart;
    }
    return assignWindowStart;
  }, [watchedSubtasks, task, assignWindowStart]);

  const { data: openLeavesInRange = [] } = useOpenLeavesInRange(
    assignWindowStart,
    assignWindowEnd,
    open,
  );

  const leaveChipByUserId = useMemo(
    () => buildLeaveChipByUserId(openLeavesInRange, assignWindowStart, assignWindowEnd),
    [openLeavesInRange, assignWindowStart, assignWindowEnd],
  );

  const childLeaveConflicts = useMemo(() => {
    const hits = new Map<number, LeaveWindowHit>();
    (watchedSubtasks ?? []).forEach((row, index) => {
      const userId = row.staffUserId?.trim();
      if (!userId) return;
      const hit = findLeaveOverlappingWindow(
        openLeavesInRange.filter((leave) => leave.userId === userId),
        assignWindowStart,
        assignWindowEnd,
      );
      if (hit) hits.set(index, hit);
    });
    return hits;
  }, [watchedSubtasks, openLeavesInRange, assignWindowStart, assignWindowEnd]);

  const canSubmit = Boolean(task && !readOnly && isAwaitingCm(task));
  const canRefuse = Boolean(
    task && !readOnly && canCmRefuseCreativeAssignment(task, currentUser?.id, currentUser?.role),
  );
  const busy = isPending || isRefusing;
  const chNote = task ? resolveChNote(task) : '';
  const creativeManagerName = currentUser?.name?.trim() || '—';
  const urgencyDisplay = task ? resolveTaskUrgencyDisplay(task) : null;
  const pmDeadline = task ? fromTaskDeadline(getTaskDeadline(task)) : null;
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
          const userId = staff.userId ?? undefined;
          return {
            value: userId ?? staff.code,
            label: staff.name,
            disabled: !canSelectAssignee(staff, allTasks, capacityByUserId),
            staff,
            activeCount: workload.activeCount,
            capacityPercent: displayCapacityPercent(staff, allTasks, capacityByUserId),
            availability: resolveAssigneeAvailability(staff, capacityByUserId),
            leaveHint: userId ? (leaveChipByUserId.get(userId) ?? null) : null,
          };
        },
      ),
    [
      staffOptions,
      allTasks,
      capacityByUserId,
      currentUser?.role,
      currentUser?.id,
      leaveChipByUserId,
    ],
  );

  useEffect(() => {
    if (!open || !task) return;
    setBriefExpanded(false);
    const defaultCreative = task.creativeDeadline
      ? fromTaskDeadline(task.creativeDeadline)
      : undefined;
    const splitName = defaultSplitChildName(task.taskName);
    const seededQty = task.quantity > 0 ? task.quantity : undefined;
    const brief = task.description?.trim() || '';
    form.setFieldsValue({
      subtasks: [
        {
          ...emptySubtask(),
          name: splitName,
          quantity: seededQty,
          description: brief,
          creativeDeadline: defaultCreative,
        },
      ],
    });
  }, [open, task, form]);

  const resetAndClose = () => {
    form.resetFields();
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
    openDeclineReasonModal({
      title: 'Từ chối nhận task này?',
      description: 'Task sẽ trả về hàng chờ Creative Head để giao lại CM.',
      onConfirm: (reason) =>
        new Promise<void>((resolve, reject) => {
          updateStatus(
            {
              id: task.id,
              staffConfirmation: 'decline',
              staffNote: reason,
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
    if (childLeaveConflicts.size > 0) {
      Modal.warning({
        title: SPLIT_ASSIGN_LEAVE_CONFLICT_TITLE,
        content: SPLIT_ASSIGN_LEAVE_CONFLICT_HINT,
      });
      return;
    }
    const values = await form.validateFields(['subtasks']);
    const childSum = (values.subtasks ?? []).reduce((sum, row) => {
      const qty = Number(row.quantity);
      return Number.isFinite(qty) && qty > 0 ? sum + qty : sum;
    }, 0);
    if (childSum > task.quantity) {
      form.setFields([
        {
          name: 'subtasks',
          errors: [
            `Tổng SL các phần (${childSum}) không được lớn hơn SL task cha (${task.quantity})`,
          ],
        },
      ]);
      return;
    }
    mutate(
      {
        id: task.id,
        payload: {
          mode: 'split',
          subtasks: (values.subtasks ?? []).map((subtask) => ({
            name: (subtask.name ?? '').trim() || defaultSplitChildName(task.taskName),
            staffUserId: (subtask.staffUserId ?? '').trim(),
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
      allowClear
      popupMatchSelectWidth={false}
      classNames={{ popup: { root: styles.staffSelectPopup } }}
      styles={{ popup: { root: { minWidth: 400 } } }}
      options={staffSelectOptions}
      optionRender={(option) => {
        const data = option.data as {
          staff: (typeof staffSelectOptions)[number]['staff'];
          activeCount: number;
          capacityPercent: number;
          availability: (typeof staffSelectOptions)[number]['availability'];
          leaveHint?: string | null;
        };
        return (
          <AssigneeOptionLabel
            staff={data.staff}
            activeCount={data.activeCount}
            capacityPercent={data.capacityPercent}
            availability={data.availability}
            leaveHint={data.leaveHint}
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
              disabled={busy || childLeaveConflicts.size > 0}
              onClick={() => void handleSubmit()}
            >
              Giao tất cả task nhỏ
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
                  <span className={styles.factValueMuted}> · CM xác nhận khi chia</span>
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
              <p className={styles.sectionLabel}>Chia task con</p>
              <p className={styles.splitSummaryHint} style={{ marginBottom: 8 }}>
                Ít nhất 1 phần. Một Staff nhận cả gói → giữ 1 task con với đủ SL. {periodNote}
                {capacityLoading ? ' · Đang tải capacity…' : null}
                {capacityError ? ' · Dùng ước lượng tạm.' : null}
              </p>

              <Form form={form} layout="vertical" size="small" className={styles.editForm}>
                <div className={styles.formSectionStack}>
                  <div className={styles.splitSummary}>
                    <span className={styles.splitSummaryTotal}>
                      {splitLockedTotal > 0
                        ? `SL các phần: ${splitLockedTotal}`
                        : 'Nhập SL từng phần (có thể 0)'}
                    </span>
                    <span className={styles.splitSummaryHint}>
                      {`SL task cha: ${task.quantity}. Tổng các phần không được lớn hơn SL này. Có thể chưa gán Staff.`}
                    </span>
                  </div>
                  <Form.List name="subtasks">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field, index) => {
                          const leaveHit = childLeaveConflicts.get(index);
                          return (
                            <div className={styles.subtaskCardCompact} key={field.key}>
                              <div className={styles.subtaskHeader}>
                                <span>Task nhỏ {index + 1}</span>
                                {fields.length > 1 ? (
                                  <Button type="link" danger onClick={() => remove(field.name)}>
                                    Xóa
                                  </Button>
                                ) : null}
                              </div>
                              <Form.Item
                                name={[field.name, 'name']}
                                label="Tên"
                                rules={
                                  defaultSplitChildName(task.taskName)
                                    ? []
                                    : [{ required: true, message: 'Nhập tên task nhỏ' }]
                                }
                              >
                                <Input
                                  placeholder={defaultSplitChildName(task.taskName) || 'Tên task'}
                                />
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
                              <div className={styles.splitAssignRow}>
                                <Form.Item
                                  name={[field.name, 'staffUserId']}
                                  label="Giao cho"
                                  className={styles.splitAssignStaff}
                                >
                                  {renderStaffSelect(false)}
                                </Form.Item>
                                <Form.Item
                                  name={[field.name, 'quantity']}
                                  label="Số lượng"
                                  className={styles.splitAssignQty}
                                  rules={[nonNegativeWholeQuantityRule]}
                                >
                                  <InputNumber
                                    min={0}
                                    precision={0}
                                    step={1}
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              </div>
                              {leaveHit ? (
                                <Alert
                                  className={styles.leaveConflictAlert}
                                  type="warning"
                                  showIcon
                                  message={SPLIT_ASSIGN_LEAVE_CONFLICT_TITLE}
                                  description={`${formatLeaveRangeLabel(leaveHit)}${
                                    assignWindowEnd ? ` · Deadline ${assignWindowEnd}` : ''
                                  }. ${SPLIT_ASSIGN_LEAVE_CONFLICT_HINT}`}
                                />
                              ) : null}
                              <Form.Item
                                name={[field.name, 'creativeDeadline']}
                                label={
                                  <CreativeDeadlineFieldLabel>
                                    Creative deadline
                                  </CreativeDeadlineFieldLabel>
                                }
                                extra={
                                  <CreativeDeadlineFieldExtra
                                    afterPm={isCreativeDeadlineAfterPmDeadline(
                                      watchedSubtasks?.[index]?.creativeDeadline,
                                      pmDeadline,
                                    )}
                                    base="Bỏ trống = dùng deadline hiện có."
                                  />
                                }
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
                          );
                        })}
                        <Button
                          className={styles.addSubtask}
                          onClick={() =>
                            add({
                              ...emptySubtask(),
                              name: defaultSplitChildName(task.taskName),
                              creativeDeadline: task.creativeDeadline
                                ? fromTaskDeadline(task.creativeDeadline)
                                : undefined,
                            })
                          }
                        >
                          + Thêm task nhỏ
                        </Button>
                      </>
                    )}
                  </Form.List>
                </div>
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
