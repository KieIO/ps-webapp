import { Alert, Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateCreativePipeline } from '../../hooks/useUpdateCreativePipeline';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import type { MyTask } from '../../schemas/task.schema';
import { fromTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  canChangeCreativeLevelRole,
  canEditCreativePipelineTask,
  canReassignCreativeManager,
  canReassignCreativeStaff,
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeAssignableExecutors,
  filterCreativeManagers,
  getAssigneeWorkload,
  getCreativeSplitSubtasks,
  isCreativeLevelLockedByStaffConfirm,
  isSplitChildTask,
  isSplitParentTask,
  isSplitQuantityConserved,
  PIPELINE_STAGE_LABELS,
  resolveAssigneeAvailability,
  resolveEffectivePipelineStage,
  resolveWholeAssignStaff,
} from '../../utils/creativePipeline';
import {
  canEditCreativeDeadline,
  canEditCreativeScheduleMeta,
} from '../../utils/creativeVisibility';
import { getTaskDeadline } from '../../utils/taskDetail';
import { normalizeTaskUrgencySetting, resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import { ClassificationScale } from '../CreateTaskDrawer/ClassificationScale';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
import { AssigneeOptionLabel } from './AssigneeOptionLabel';
import { CreativeAssignModeSection } from './CreativeAssignModeSection';
import styles from './creativePipeline.module.scss';

interface CreativeEditDrawerProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

type EditFormValues = {
  description?: string;
  additionalFactors?: string;
  quantity?: number;
  childQuantities?: Record<string, number>;
  deadline?: dayjs.Dayjs | null;
  creativeDeadline?: dayjs.Dayjs | null;
  urgency?: ProjectUrgency;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  staffUserId?: string;
  cmUserId?: string;
  staffNote?: string;
};

export function CreativeEditDrawer({ open, task, onClose }: CreativeEditDrawerProps) {
  const [form] = Form.useForm<EditFormValues>();
  const role = useAppSelector((state) => state.auth.user?.role);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { mutate, isPending } = useUpdateCreativePipeline();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const watchedCreativeDeadline = Form.useWatch('creativeDeadline', form);
  const capacityDeadlineOverride = useMemo(
    () => (watchedCreativeDeadline?.isValid() ? toTaskDeadline(watchedCreativeDeadline) : null),
    [watchedCreativeDeadline],
  );
  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
  } = useAssignPickerCapacity(task, open, capacityDeadlineOverride);

  const canEdit = Boolean(task && canEditCreativePipelineTask(task, role, userId));
  const canEditSchedule = canEdit && canEditCreativeScheduleMeta(role);
  const canEditLevel = Boolean(task && canChangeCreativeLevelRole(role));
  const levelLocked = Boolean(task && isCreativeLevelLockedByStaffConfirm(task));
  const canReassign = Boolean(task && canReassignCreativeStaff(task, role) && canEdit);
  const canReassignCm = Boolean(task && canReassignCreativeManager(task, role) && canEdit);
  const stage = task ? resolveEffectivePipelineStage(task) : undefined;
  const splitParent = Boolean(task && isSplitParentTask(task));
  const splitChild = Boolean(task && isSplitChildTask(task));
  // Match BE: Admin/PM anytime; CM only on assigned_staff / split child (not awaiting_cm / split parent).
  const canEditCreativeDl =
    canEdit &&
    canEditCreativeDeadline(role) &&
    (canEditCreativeScheduleMeta(role) || stage === 'assigned_staff' || splitChild);
  const splitSiblings = useMemo(() => {
    if (!task?.parentTaskId) return [];
    const parent = allTasks.find((entry) => entry.id === task.parentTaskId);
    if (!parent) {
      return allTasks.filter(
        (entry) => entry.parentTaskId === task.parentTaskId && entry.taskKind !== 'revision',
      );
    }
    return getCreativeSplitSubtasks(parent, allTasks);
  }, [allTasks, task]);
  const splitChildren = useMemo(
    () => (task && splitParent ? getCreativeSplitSubtasks(task, allTasks) : []),
    [allTasks, splitParent, task],
  );
  const lockedParentTotal = useMemo(() => {
    if (splitParent && task) return task.quantity;
    if (splitChild && task?.parentTaskId) {
      return allTasks.find((entry) => entry.id === task.parentTaskId)?.quantity;
    }
    return undefined;
  }, [allTasks, splitChild, splitParent, task]);
  const quantityLocked = splitParent;
  const quantityRequired =
    !quantityLocked && (stage === 'assigned_staff' || stage === 'split' || splitChild);
  const urgencyDisplay = task ? resolveTaskUrgencyDisplay(task) : null;
  const quantityFamily = useMemo(() => {
    if (splitParent) return splitChildren;
    if (splitChild) return splitSiblings;
    return [];
  }, [splitChild, splitChildren, splitParent, splitSiblings]);
  const watchedChildQuantities = Form.useWatch('childQuantities', form);
  const allocatedFromForm = useMemo(() => {
    if (quantityFamily.length === 0) return 0;
    return quantityFamily.reduce((sum, child) => {
      const fromForm = watchedChildQuantities?.[child.id];
      const qty = fromForm != null ? Number(fromForm) : child.quantity;
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
  }, [quantityFamily, watchedChildQuantities]);

  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const computedLevel =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : task?.level;

  const staffSelectOptions = useMemo(
    () =>
      filterCreativeAssignableExecutors(staffOptions, role, userId).map((staff) => {
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
      }),
    [staffOptions, allTasks, capacityByUserId, role, userId],
  );

  const cmSelectOptions = useMemo(
    () =>
      filterCreativeManagers(staffOptions).map((staff) => {
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
      }),
    [staffOptions, allTasks, capacityByUserId],
  );

  useEffect(() => {
    if (!open || !task) return;
    const childQuantities = Object.fromEntries(
      quantityFamily.map((child) => [child.id, child.quantity]),
    );
    form.setFieldsValue({
      description: task.description,
      additionalFactors: task.additionalFactors,
      quantity: task.quantity > 0 ? task.quantity : undefined,
      childQuantities,
      deadline: fromTaskDeadline(getTaskDeadline(task)),
      creativeDeadline: task.creativeDeadline ? fromTaskDeadline(task.creativeDeadline) : null,
      urgency: normalizeTaskUrgencySetting(task.urgency),
      designThinking: task.designThinking,
      technical: task.technical,
      contentProcessing: task.contentProcessing,
      staffUserId: resolveWholeAssignStaff(task)[0]?.userId ?? task.staff[0]?.userId ?? undefined,
      cmUserId: task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined,
      staffNote: task.staffNote || task.cmNote || '',
    });
  }, [open, task, form, quantityFamily]);

  const resetAndClose = () => {
    form.resetFields();
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    if (canEdit && form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy chỉnh sửa?',
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

  const handleSubmit = async () => {
    if (!task || !canEdit) return;
    const values = await form.validateFields();

    const changedChildQuantities =
      quantityFamily.length > 0
        ? quantityFamily
            .map((child) => ({
              id: child.id,
              quantity: Number(values.childQuantities?.[child.id] ?? child.quantity),
            }))
            .filter((row) => {
              const original = quantityFamily.find((child) => child.id === row.id);
              return original != null && Math.abs(row.quantity - original.quantity) > 1e-6;
            })
        : [];

    if (changedChildQuantities.length > 0 && lockedParentTotal != null) {
      const projected = quantityFamily.map((child) => {
        const override = changedChildQuantities.find((row) => row.id === child.id);
        return { ...child, quantity: override?.quantity ?? child.quantity };
      });
      if (!isSplitQuantityConserved(lockedParentTotal, projected)) {
        form.setFields([
          {
            name: 'childQuantities',
            errors: [
              `Tổng SL các phần (${allocatedFromForm}) phải bằng SL tổng (${lockedParentTotal})`,
            ],
          },
        ]);
        return;
      }
    }

    const currentCmId = task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined;
    const cmChanged = canReassignCm && values.cmUserId && values.cmUserId !== currentCmId;

    const staffChanged =
      canReassign &&
      values.staffUserId &&
      values.staffUserId !==
        (resolveWholeAssignStaff(task)[0]?.userId ?? task.staff[0]?.userId ?? undefined);

    let creativeDeadlinePayload: string | undefined;
    if (canEditCreativeDl) {
      if (values.creativeDeadline?.isValid()) {
        const next = toTaskDeadline(values.creativeDeadline);
        const prev = task.creativeDeadline;
        const same =
          prev != null &&
          fromTaskDeadline(prev).format('YYYY-MM-DD HH:mm:ss') ===
            values.creativeDeadline.format('YYYY-MM-DD HH:mm:ss');
        if (!same) creativeDeadlinePayload = next;
      } else if (values.creativeDeadline === null && task.creativeDeadline) {
        creativeDeadlinePayload = '';
      }
    }

    mutate(
      {
        id: task.id,
        payload: {
          description: values.description,
          additionalFactors: values.additionalFactors,
          ...(quantityLocked || splitChild || splitParent ? {} : { quantity: values.quantity }),
          ...(changedChildQuantities.length > 0 ? { childQuantities: changedChildQuantities } : {}),
          ...(canEditSchedule
            ? {
                deadline: values.deadline?.isValid() ? toTaskDeadline(values.deadline) : undefined,
                urgency: values.urgency,
              }
            : {}),
          ...(creativeDeadlinePayload !== undefined
            ? { creativeDeadline: creativeDeadlinePayload }
            : {}),
          ...(canEditLevel && !levelLocked
            ? {
                designThinking: values.designThinking,
                technical: values.technical,
                contentProcessing: values.contentProcessing,
              }
            : {}),
          cmUserId: cmChanged ? values.cmUserId : undefined,
          staffUserId: staffChanged ? values.staffUserId : undefined,
          staffNote: values.staffNote,
        },
      },
      { onSuccess: resetAndClose },
    );
  };

  return (
    <Drawer
      title="Sửa / Đổi giao task Creative"
      open={open}
      onClose={handleCloseRequest}
      width={520}
      destroyOnHidden
      maskClosable={!isPending}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCloseRequest} disabled={isPending}>
            {canEdit ? 'Hủy' : 'Đóng'}
          </Button>
          {canEdit ? (
            <Button type="primary" loading={isPending} onClick={() => void handleSubmit()}>
              Lưu thay đổi
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
                {stage ? ` · ${PIPELINE_STAGE_LABELS[stage]}` : ''}
                {` · Status: ${task.staffConfirmation}`}
              </span>
              {!canEditSchedule && urgencyDisplay ? (
                <ProjectUrgencyBadge urgency={urgencyDisplay} />
              ) : null}
            </p>
          </div>

          {!canEdit ? (
            <Alert type="warning" showIcon message="Bạn chỉ có thể xem task này." />
          ) : null}

          {!splitChild ? (
            <CreativeAssignModeSection
              task={task}
              allTasks={allTasks}
              showReassignHint={canReassign && !splitParent}
            />
          ) : null}

          {splitParent ? (
            <Alert
              type="info"
              showIcon
              message={`SL tổng đã khoá: ${task.quantity}`}
              description="Chỉnh Staff / SL trên từng task nhỏ (link Mở hoặc từ My Tasks). Tổng các phần phải luôn bằng SL tổng."
            />
          ) : null}

          {splitChild && lockedParentTotal != null ? (
            <Alert
              type="info"
              showIcon
              message={`Task nhỏ · SL tổng gốc ${lockedParentTotal}`}
              description="Đổi Staff / SL tại đây. Tổng SL mọi phần phải luôn bằng SL tổng."
            />
          ) : null}

          <Form form={form} layout="vertical" disabled={!canEdit || isPending}>
            <Form.Item name="description" label="Brief / mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="additionalFactors" label="Yếu tố bổ sung">
              <Input.TextArea rows={2} />
            </Form.Item>
            {quantityFamily.length > 0 ? (
              <div className={styles.subtaskCard}>
                <p className={styles.sectionLabel}>
                  SL các phần · {allocatedFromForm}
                  {lockedParentTotal != null ? ` / ${lockedParentTotal}` : ''}
                </p>
                {quantityFamily.map((child) => {
                  const qtyLocked =
                    child.staffConfirmation === 'confirmed' ||
                    child.staffConfirmation === 'finished' ||
                    child.staffConfirmation === 'cancelled';
                  return (
                    <Form.Item
                      key={child.id}
                      name={['childQuantities', child.id]}
                      label={`${child.taskCode}: ${child.taskName}`}
                      rules={[
                        { required: true, message: 'Nhập SL' },
                        { type: 'number', min: 0.01, message: 'SL > 0' },
                      ]}
                      extra={
                        qtyLocked
                          ? 'Đã confirm/finish — không đổi SL'
                          : child.staff[0]?.name
                            ? `Staff: ${child.staff[0].name}`
                            : undefined
                      }
                    >
                      <InputNumber
                        min={0.01}
                        step={1}
                        style={{ width: '100%' }}
                        disabled={!canEdit || qtyLocked || isPending}
                      />
                    </Form.Item>
                  );
                })}
              </div>
            ) : splitParent || splitChild ? (
              <>
                {splitParent ? (
                  <Form.Item label="SL tổng (đã khoá)">
                    <InputNumber value={task.quantity} style={{ width: '100%' }} disabled />
                  </Form.Item>
                ) : null}
                <Alert
                  type="warning"
                  showIcon
                  message="Chưa tải được danh sách task nhỏ"
                  description="Không chỉnh SL khi thiếu danh sách phần. Đóng drawer rồi mở lại, hoặc mở từng task nhỏ từ My Tasks khi đã có đủ dữ liệu."
                />
              </>
            ) : (
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={
                  quantityRequired
                    ? [
                        { required: true, message: 'CM nhập số lượng' },
                        { type: 'number', min: 0.01, message: 'Số lượng phải lớn hơn 0' },
                      ]
                    : undefined
                }
                extra={
                  quantityRequired
                    ? 'Task Creative: CM điền / chỉnh số lượng.'
                    : 'CM sẽ nhập số lượng khi giao Staff.'
                }
              >
                <InputNumber
                  min={0.01}
                  step={1}
                  style={{ width: '100%' }}
                  disabled={!canEdit || isPending}
                />
              </Form.Item>
            )}

            <div className={styles.deadlineRow}>
              <Form.Item
                name="deadline"
                label="Deadline PM"
                className={styles.deadlineField}
                rules={
                  canEditSchedule ? [{ required: true, message: 'Chọn deadline PM' }] : undefined
                }
                extra={!canEditSchedule ? 'Chỉ Admin / PM được sửa.' : undefined}
              >
                <DatePicker
                  showTime={{
                    format: 'HH:mm',
                    defaultValue: dayjs().second(0).millisecond(0),
                  }}
                  format={DATETIME_SHORT_FORMAT}
                  style={{ width: '100%' }}
                  allowClear={false}
                  disabled={!canEdit || !canEditSchedule}
                  showNow={false}
                />
              </Form.Item>
              <Form.Item
                name="creativeDeadline"
                label="Creative deadline"
                className={styles.deadlineField}
                extra={
                  !canEditCreativeDeadline(role)
                    ? 'Không có quyền sửa.'
                    : !canEditCreativeDl
                      ? 'CM chỉ sửa creative deadline sau khi đã giao Staff.'
                      : canEditSchedule
                        ? undefined
                        : 'CM quyết deadline nội bộ.'
                }
              >
                <DatePicker
                  showTime={{
                    format: 'HH:mm',
                    defaultValue: dayjs().second(0).millisecond(0),
                  }}
                  format={DATETIME_SHORT_FORMAT}
                  style={{ width: '100%' }}
                  allowClear={canEditCreativeDl}
                  disabled={!canEdit || !canEditCreativeDl}
                  placeholder="Nội bộ"
                  showNow={false}
                />
              </Form.Item>
            </div>

            {canEditSchedule ? (
              <Form.Item
                name="urgency"
                label="Urgency"
                className={styles.urgencyField}
                rules={[{ required: true, message: 'Chọn mức urgency' }]}
              >
                <TaskUrgencySelect />
              </Form.Item>
            ) : null}

            <Form.Item name="staffNote" label="Ghi chú">
              <Input.TextArea rows={2} />
            </Form.Item>

            {canReassignCm ? (
              <>
                <p className={styles.sectionLabel}>Đổi Creative Manager</p>
                <Form.Item
                  name="cmUserId"
                  label="Creative Manager"
                  rules={[{ required: true, message: 'Chọn Creative Manager' }]}
                  extra="Chỉ đổi được khi task còn chờ CM giao Staff."
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={cmSelectOptions}
                    optionRender={(option) => {
                      const data = option.data as {
                        staff: (typeof cmSelectOptions)[number]['staff'];
                        activeCount: number;
                        capacityPercent: number;
                        availability: (typeof cmSelectOptions)[number]['availability'];
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
                </Form.Item>
              </>
            ) : null}

            <p className={styles.sectionLabel}>Phân loại độ khó / Level</p>
            {levelLocked ? (
              <Alert
                type="info"
                showIcon
                className={styles.banner}
                message="Staff đã confirm. Không đổi Level được."
              />
            ) : null}
            {!canEditLevel ? (
              <Alert
                type="info"
                showIcon
                className={styles.banner}
                message="Creative Manager không được đổi Level."
              />
            ) : null}
            <Form.Item name="designThinking" label={MY_TASK_COLUMN_HEADERS.designThinking}>
              <ClassificationScale disabled={!canEdit || !canEditLevel || levelLocked} />
            </Form.Item>
            <Form.Item name="technical" label={MY_TASK_COLUMN_HEADERS.technical}>
              <ClassificationScale disabled={!canEdit || !canEditLevel || levelLocked} />
            </Form.Item>
            <Form.Item name="contentProcessing" label={MY_TASK_COLUMN_HEADERS.contentProcessing}>
              <ClassificationScale disabled={!canEdit || !canEditLevel || levelLocked} />
            </Form.Item>
            <div className={styles.levelBox}>Level task: {computedLevel ?? '—'}</div>

            {canReassign ? (
              <>
                <p className={styles.sectionLabel}>Đổi Staff nhận task</p>
                <p className={styles.note}>{periodNote}</p>
                <Form.Item name="staffUserId" label="Creative Staff">
                  <Select
                    showSearch
                    optionFilterProp="label"
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
                </Form.Item>
                <p className={styles.note}>
                  Đổi Staff sẽ reset confirm và gửi noti task mới. Có thể giao khi Overloaded;
                  capacity hiển thị theo thực tế (có thể &gt; 100%).
                  {capacityLoading ? ' Đang tải capacity…' : null}
                </p>
              </>
            ) : null}
          </Form>
        </div>
      ) : null}
    </Drawer>
  );
}
