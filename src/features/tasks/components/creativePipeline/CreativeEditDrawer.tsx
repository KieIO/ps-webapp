import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath, DATETIME_SHORT_FORMAT } from '@/config/constants';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { CONFIRMATION_LABELS, MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateCreativePipeline } from '../../hooks/useUpdateCreativePipeline';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import type { MyTask } from '../../schemas/task.schema';
import { formatTaskDateTime, fromTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
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
  const pmDeadlineIso = task ? getTaskDeadline(task) : null;
  const pmDeadlineLabel = pmDeadlineIso ? formatTaskDateTime(pmDeadlineIso) : '—';
  const creativeDeadlineLabel = task?.creativeDeadline
    ? formatTaskDateTime(task.creativeDeadline)
    : '—';
  const statusLabel = task ? CONFIRMATION_LABELS[task.staffConfirmation] : '—';
  const headerQuantity =
    lockedParentTotal != null
      ? lockedParentTotal
      : task && task.quantity > 0
        ? task.quantity
        : null;
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
  const allocationConserved =
    lockedParentTotal != null && quantityFamily.length > 0
      ? isSplitQuantityConserved(
          lockedParentTotal,
          quantityFamily.map((child) => {
            const fromForm = watchedChildQuantities?.[child.id];
            const qty = fromForm != null ? Number(fromForm) : child.quantity;
            return { ...child, quantity: Number.isFinite(qty) ? qty : 0 };
          }),
        )
      : true;
  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  // Prefer form watches, else task criteria — never fall back to stale task.level alone
  // (header vs expanded box would disagree before Form.useWatch hydrates).
  const computedLevel = useMemo(() => {
    const design = designThinking ?? task?.designThinking;
    const tech = technical ?? task?.technical;
    const content = contentProcessing ?? task?.contentProcessing;
    if (design != null && tech != null && content != null) {
      return computeTaskLevel(design, tech, content);
    }
    return task?.level;
  }, [
    designThinking,
    technical,
    contentProcessing,
    task?.designThinking,
    task?.technical,
    task?.contentProcessing,
    task?.level,
  ]);

  const staffSelectOptions = useMemo(() => {
    const base = filterCreativeAssignableExecutors(staffOptions, role, userId);
    const currentStaff = task
      ? (resolveWholeAssignStaff(task)[0] ?? task.staff[0] ?? undefined)
      : undefined;
    const withCurrent =
      currentStaff?.userId && !base.some((entry) => entry.userId === currentStaff.userId)
        ? [currentStaff, ...base]
        : base;

    return withCurrent.map((staff) => {
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
    });
  }, [staffOptions, allTasks, capacityByUserId, role, userId, task]);

  const cmSelectOptions = useMemo(() => {
    const base = filterCreativeManagers(staffOptions);
    const currentCm = task?.creativeManager;
    const withCurrent =
      currentCm?.userId && !base.some((entry) => entry.userId === currentCm.userId)
        ? [
            {
              code: currentCm.code,
              name: currentCm.name,
              userId: currentCm.userId,
              department: 'creative_hcm',
              availability: 'normal' as const,
              role: 'creative_manager' as const,
            },
            ...base,
          ]
        : base;

    return withCurrent.map((staff) => {
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
    });
  }, [staffOptions, allTasks, capacityByUserId, task]);

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
      className={styles.assignDrawer}
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
              </span>
              {!canEditSchedule && urgencyDisplay ? (
                <ProjectUrgencyBadge urgency={urgencyDisplay} />
              ) : null}
            </p>
            <div className={styles.factsRow}>
              <div className={styles.fact}>
                <span className={styles.factLabel}>SL tổng</span>
                <span className={styles.factValue}>
                  {headerQuantity != null ? headerQuantity : '—'}
                  {splitParent || splitChild ? (
                    <span className={styles.factValueMuted}> · khoá</span>
                  ) : null}
                </span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Deadline PM</span>
                <span className={styles.factValue}>{pmDeadlineLabel}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Creative DL</span>
                <span className={styles.factValue}>{creativeDeadlineLabel}</span>
              </div>
              <div className={styles.fact}>
                <span className={styles.factLabel}>Status</span>
                <span className={styles.statusChip}>{statusLabel}</span>
              </div>
            </div>
          </div>

          {!canEdit ? (
            <Alert type="warning" showIcon message="Bạn chỉ có thể xem task này." />
          ) : null}

          <Form
            form={form}
            layout="vertical"
            disabled={!canEdit || isPending}
            className={styles.editForm}
          >
            <div className={styles.formSection}>
              {splitParent || splitChild ? (
                <div className={styles.allocationBlock}>
                  <div className={styles.allocationHeader}>
                    <span className={styles.allocationChip}>
                      {splitParent ? 'Đã chia nhỏ' : 'Task nhỏ'}
                    </span>
                    {lockedParentTotal != null ? (
                      <span
                        className={`${styles.allocationSum} ${
                          allocationConserved ? '' : styles.allocationSumWarn
                        }`}
                      >
                        {allocatedFromForm} / {lockedParentTotal}
                        {allocationConserved ? ' · khớp' : ' · lệch'}
                      </span>
                    ) : null}
                  </div>
                  <p className={styles.allocationHint}>
                    {splitParent
                      ? 'SL tổng đã khoá. Chỉnh SL từng phần bên dưới — tổng phải luôn bằng SL tổng. Chi tiết để xem/đổi Staff.'
                      : 'Đổi SL tại đây. Tổng mọi phần phải bằng SL tổng gốc.'}
                  </p>
                  {!allocationConserved ? (
                    <Alert
                      type="warning"
                      showIcon
                      className={styles.banner}
                      message="Tổng SL các phần lệch so với SL tổng"
                    />
                  ) : null}
                  {quantityFamily.length > 0 ? (
                    quantityFamily.map((child, index) => {
                      const qtyLocked =
                        child.staffConfirmation === 'confirmed' ||
                        child.staffConfirmation === 'finished' ||
                        child.staffConfirmation === 'cancelled';
                      return (
                        <div className={styles.allocationRow} key={child.id}>
                          <div className={styles.allocationMeta}>
                            <p className={styles.allocationTitle}>
                              {index + 1}. {child.taskName}
                            </p>
                            <p className={styles.allocationSub}>
                              {child.taskCode}
                              {child.staff[0]?.name ? ` · ${child.staff[0].name}` : ''}
                              {qtyLocked
                                ? ` · ${CONFIRMATION_LABELS[child.staffConfirmation]}`
                                : ''}
                            </p>
                          </div>
                          <div className={styles.allocationQty}>
                            <Form.Item
                              name={['childQuantities', child.id]}
                              rules={[
                                { required: true, message: 'Nhập SL' },
                                { type: 'number', min: 0.01, message: 'SL > 0' },
                              ]}
                            >
                              <InputNumber
                                min={0.01}
                                step={1}
                                style={{ width: '100%' }}
                                disabled={!canEdit || qtyLocked || isPending}
                                aria-label={`SL ${child.taskCode}`}
                              />
                            </Form.Item>
                          </div>
                          <Link
                            className={styles.allocationLink}
                            to={buildMyTaskDetailPath(child.id)}
                          >
                            Chi tiết
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <Alert
                      type="warning"
                      showIcon
                      className={styles.banner}
                      message="Chưa tải được danh sách task nhỏ"
                      description="Đóng drawer rồi mở lại, hoặc mở từng task nhỏ từ My Tasks."
                    />
                  )}
                </div>
              ) : (
                <div className={styles.formSectionStack}>
                  <CreativeAssignModeSection
                    task={task}
                    allTasks={allTasks}
                    showReassignHint={canReassign}
                  />
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
                </div>
              )}
            </div>

            {canReassign ? (
              <div className={styles.formSection}>
                <p className={styles.sectionLabel}>Đổi Staff nhận task</p>
                <Form.Item
                  name="staffUserId"
                  label="Creative Staff"
                  extra={
                    <>
                      {periodNote}
                      <br />
                      Đổi Staff sẽ reset confirm và gửi noti task mới. Có thể giao khi Overloaded;
                      capacity hiển thị theo thực tế (có thể &gt; 100%).
                      {capacityLoading ? ' Đang tải capacity…' : null}
                    </>
                  }
                >
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
              </div>
            ) : null}

            {canReassignCm ? (
              <div className={styles.formSection}>
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
              </div>
            ) : null}

            <div className={styles.formSection}>
              <p className={styles.sectionLabel}>Nội dung</p>
              <div className={styles.formSectionStack}>
                <Form.Item name="description" label="Brief / mô tả">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="additionalFactors" label="Yếu tố bổ sung">
                  <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item name="staffNote" label="Ghi chú">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </div>
            </div>

            <div className={styles.formSection}>
              <p className={styles.sectionLabel}>Lịch</p>
              <div className={styles.formSectionStack}>
                <div className={styles.deadlineRow}>
                  <Form.Item
                    name="deadline"
                    label="Deadline PM"
                    className={styles.deadlineField}
                    rules={
                      canEditSchedule
                        ? [{ required: true, message: 'Chọn deadline PM' }]
                        : undefined
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
              </div>
            </div>

            <div className={styles.formSection}>
              <Collapse
                ghost
                className={styles.secondaryPanel}
                items={[
                  {
                    key: 'level',
                    label: (
                      <span className={styles.sectionLabel} style={{ margin: 0 }}>
                        Phân loại độ khó / Level · {computedLevel ?? '—'}
                      </span>
                    ),
                    children: (
                      <div className={styles.formSectionStack}>
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
                        <Form.Item
                          name="designThinking"
                          label={MY_TASK_COLUMN_HEADERS.designThinking}
                        >
                          <ClassificationScale
                            disabled={!canEdit || !canEditLevel || levelLocked}
                          />
                        </Form.Item>
                        <Form.Item name="technical" label={MY_TASK_COLUMN_HEADERS.technical}>
                          <ClassificationScale
                            disabled={!canEdit || !canEditLevel || levelLocked}
                          />
                        </Form.Item>
                        <Form.Item
                          name="contentProcessing"
                          label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                        >
                          <ClassificationScale
                            disabled={!canEdit || !canEditLevel || levelLocked}
                          />
                        </Form.Item>
                        <div className={styles.levelBox}>Level task: {computedLevel ?? '—'}</div>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </Form>
        </div>
      ) : null}
    </Drawer>
  );
}
