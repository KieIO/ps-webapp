import {
  Alert,
  Button,
  Checkbox,
  Collapse,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buildMyTaskDetailPath, DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useTaskScoreList } from '@/features/task-scores/hooks/useTaskScoreList';
import { resolveTaskType } from '@/features/task-scores/utils/resolveTaskType';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { CONFIRMATION_LABELS, MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useCreativeSplitChildren } from '../../hooks/useCreativeSplitChildren';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateCreativePipeline } from '../../hooks/useUpdateCreativePipeline';
import type { MyTask } from '../../schemas/task.schema';
import {
  creativeDeadlineFieldExtra,
  formatTaskDateTime,
  fromTaskDeadline,
  isCreativeDeadlineAfterPmDeadline,
  toTaskDeadline,
} from '../../utils/taskDates';
import { computeTaskLevel } from '../../utils/taskLevel';
import { wholeTaskQuantityRule, nonNegativeWholeQuantityRule } from '../../utils/taskQuantity';
import { defaultSplitChildName, parseTaskScoreName } from '../../utils/taskScoreName';
import {
  canChangeCreativeLevelRole,
  canEditCreativePipelineTask,
  canEditSplitParentTotal,
  canReassignCreativeManager,
  canReassignCreativeStaff,
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeAssignableExecutors,
  filterCreativeManagers,
  getAssigneeWorkload,
  isCreativeLevelLockedByStaffConfirm,
  inferParentTaskCodeFromSplit,
  isQaSplitChildTask,
  isSplitChildQuantityLocked,
  isSplitChildTask,
  isSplitParentTask,
  pickPrimaryEditableSplitChild,
  PIPELINE_STAGE_LABELS,
  SPLIT_CHILD_BADGE_LABEL,
  SPLIT_PARENT_BADGE_LABEL,
  resolveAssigneeAvailability,
  resolveEffectivePipelineStage,
  resolveWholeAssignStaff,
  sumSplitChildrenQuantity,
} from '../../utils/creativePipeline';
import {
  canEditCreativeDeadline,
  canEditCreativeScheduleMeta,
  CREATIVE_DEADLINE_META_EDIT_HINT,
} from '../../utils/creativeVisibility';
import { getTaskDeadline } from '../../utils/taskDetail';
import {
  isTaskMetaEditLockedByStatus,
  TASK_META_EDIT_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import { normalizeTaskUrgencySetting, resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import { ClassificationScale } from '../CreateTaskDrawer/ClassificationScale';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
import { CreativeDeadlineFieldLabel } from '../CreativeDeadlineFieldLabel/CreativeDeadlineFieldLabel';
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
  changeReason?: string;
  newChildren?: {
    name?: string;
    description?: string;
    quantity?: number;
    staffUserId?: string;
    asQa?: boolean;
    qaLevel?: number;
  }[];
};

export function CreativeEditDrawer({ open, task, onClose }: CreativeEditDrawerProps) {
  const [form] = Form.useForm<EditFormValues>();
  const role = useAppSelector((state) => state.auth.user?.role);
  const userId = useAppSelector((state) => state.auth.user?.id);
  const { mutate, isPending } = useUpdateCreativePipeline();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskScoreList } = useTaskScoreList({ search: 'QA' }, { enabled: open });
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);
  const stagePreview = task ? resolveEffectivePipelineStage(task) : undefined;
  const needsSplitFamily = Boolean(
    open &&
      task &&
      (stagePreview === 'split' ||
        (task.parentTaskId && (task.taskKind === 'split' || !task.taskKind))),
  );
  const {
    data: splitFamily = [],
    isLoading: splitFamilyLoading,
    isError: splitFamilyError,
  } = useCreativeSplitChildren(task?.id, { enabled: needsSplitFamily });
  const watchedCreativeDeadline = Form.useWatch('creativeDeadline', form);
  const watchedPmDeadline = Form.useWatch('deadline', form);
  const watchedNewChildren = Form.useWatch('newChildren', form);
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
  const statusLocked = Boolean(
    task && isTaskMetaEditLockedByStatus(task.staffConfirmation) && role !== ROLES.ADMIN,
  );
  const readOnlyMessage =
    statusLocked && task
      ? TASK_META_EDIT_STATUS_LOCKED_MESSAGE(task.staffConfirmation)
      : 'Bạn chỉ có thể xem task này.';
  const isCreator = Boolean(userId && task?.createdById && userId === task.createdById);
  const canEditSchedule =
    canEdit && (canEditCreativeScheduleMeta(role) || isCreator || role === ROLES.HEAD);
  const canEditLevel = Boolean(
    task &&
      (canChangeCreativeLevelRole(role) || isCreator) &&
      !isCreativeLevelLockedByStaffConfirm(task),
  );
  const levelLocked = Boolean(task && isCreativeLevelLockedByStaffConfirm(task));
  const canReassign = Boolean(task && canReassignCreativeStaff(task, role) && canEdit);
  const canReassignCm = Boolean(task && canReassignCreativeManager(task, role) && canEdit);
  const stage = task ? resolveEffectivePipelineStage(task) : undefined;
  const splitParent = Boolean(task && isSplitParentTask(task));
  const splitChild = Boolean(task && isSplitChildTask(task));
  // Match BE: Admin/PM/Head/creator anytime; CM only on assigned_staff / split child.
  const canEditCreativeDl =
    canEdit &&
    (canEditCreativeDeadline(role) || isCreator || role === ROLES.HEAD) &&
    (canEditCreativeScheduleMeta(role) ||
      isCreator ||
      role === ROLES.HEAD ||
      stage === 'assigned_staff' ||
      splitChild);
  const lockedParentTotal = useMemo(() => {
    if (splitParent && task) return task.quantity;
    if (splitChild && task?.parentTaskId) {
      return (
        allTasks.find((entry) => entry.id === task.parentTaskId)?.quantity ??
        // Parent may be absent from oversight lists — fall back to family sum + this child's known total via API parent qty when available.
        undefined
      );
    }
    return undefined;
  }, [allTasks, splitChild, splitParent, task]);
  const quantityRequired =
    !splitParent && !splitChild && (stage === 'assigned_staff' || stage === 'split');
  const canEditSplitTotal = Boolean(canEdit && canEditSplitParentTotal(role, userId, task));
  const canAddSplitChild = Boolean(
    canEdit && (role === ROLES.ADMIN || role === ROLES.PM) && (splitParent || splitChild),
  );
  const urgencyDisplay = task ? resolveTaskUrgencyDisplay(task) : null;
  const pmDeadlineIso = task ? getTaskDeadline(task) : null;
  const pmDeadlineLimit = watchedPmDeadline?.isValid()
    ? watchedPmDeadline
    : pmDeadlineIso
      ? fromTaskDeadline(pmDeadlineIso)
      : null;
  const creativeAfterPm = isCreativeDeadlineAfterPmDeadline(
    watchedCreativeDeadline,
    pmDeadlineLimit,
  );
  const pmDeadlineLabel = pmDeadlineIso ? formatTaskDateTime(pmDeadlineIso) : '—';
  const creativeDeadlineLabel = task?.creativeDeadline
    ? formatTaskDateTime(task.creativeDeadline)
    : '—';
  const statusLabel = task ? CONFIRMATION_LABELS[task.staffConfirmation] : '—';
  const quantityFamily = useMemo(() => {
    if (!splitParent && !splitChild) return [];
    return [...splitFamily].sort((a, b) => a.taskCode.localeCompare(b.taskCode));
  }, [splitChild, splitFamily, splitParent]);
  const effectiveParentTotal = useMemo(() => {
    if (lockedParentTotal != null) return lockedParentTotal;
    if (quantityFamily.length > 0) return sumSplitChildrenQuantity(quantityFamily);
    return undefined;
  }, [lockedParentTotal, quantityFamily]);
  const headerQuantity =
    effectiveParentTotal != null
      ? effectiveParentTotal
      : task && task.quantity > 0
        ? task.quantity
        : null;
  const watchedChildQuantities = Form.useWatch('childQuantities', form);
  const watchedParentQuantity = Form.useWatch('quantity', form);
  const qaLevelOptions = useMemo(() => {
    const scores = taskScoreList?.items ?? [];
    const levels = new Map<number, string>();
    for (const score of scores) {
      const type = resolveTaskType(score.taskType, score.name).trim().toLowerCase();
      if (type !== 'qa') continue;
      const { level } = parseTaskScoreName(score.name);
      if (level == null || level < 1 || level > 5) continue;
      levels.set(level, `QA ${level}`);
    }
    return [...levels.entries()]
      .sort(([a], [b]) => a - b)
      .map(([value, label]) => ({ value, label }));
  }, [taskScoreList?.items]);
  const existingAllocatedFromForm = useMemo(() => {
    if (quantityFamily.length === 0) return 0;
    return quantityFamily.reduce((sum, child) => {
      if (isQaSplitChildTask(child)) return sum;
      const fromForm = watchedChildQuantities?.[child.id];
      const qty = fromForm != null ? Number(fromForm) : child.quantity;
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
  }, [quantityFamily, watchedChildQuantities]);
  const newChildrenAllocated = useMemo(
    () =>
      (watchedNewChildren ?? []).reduce((sum, row) => {
        if (row?.asQa) return sum;
        const qty = Number(row?.quantity);
        return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0);
      }, 0),
    [watchedNewChildren],
  );
  const allocatedFromForm = existingAllocatedFromForm + newChildrenAllocated;
  const parentTotalFromForm =
    watchedParentQuantity != null && Number.isFinite(Number(watchedParentQuantity))
      ? Number(watchedParentQuantity)
      : (effectiveParentTotal ?? allocatedFromForm);
  const allocationWithinParent =
    quantityFamily.length === 0 || allocatedFromForm <= parentTotalFromForm;
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
      quantity:
        splitParent || splitChild
          ? (effectiveParentTotal ?? lockedParentTotal ?? task.quantity)
          : task.quantity > 0
            ? task.quantity
            : undefined,
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
  }, [
    open,
    task,
    form,
    quantityFamily,
    lockedParentTotal,
    effectiveParentTotal,
    splitParent,
    splitChild,
  ]);

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

  const redistributeParentDelta = (nextParentQty: number) => {
    if (quantityFamily.length === 0) return;
    const currentRows = quantityFamily.map((child) => {
      const fromForm = form.getFieldValue(['childQuantities', child.id]);
      const qty = fromForm != null ? Number(fromForm) : child.quantity;
      return { ...child, quantity: Number.isFinite(qty) ? qty : 0 };
    });
    const currentSum = sumSplitChildrenQuantity(currentRows);
    const delta = nextParentQty - currentSum;
    if (Math.abs(delta) < 1e-6) return;
    const primary = pickPrimaryEditableSplitChild(currentRows);
    if (!primary) return;
    const nextPrimary = primary.quantity + delta;
    if (nextPrimary <= 0) return;
    form.setFieldValue(['childQuantities', primary.id], nextPrimary);
  };

  const handleFormValuesChange = (changed: Partial<EditFormValues>) => {
    if ((!splitParent && !splitChild) || !canEditSplitTotal) return;
    if (changed.quantity != null && Number.isFinite(Number(changed.quantity))) {
      redistributeParentDelta(Number(changed.quantity));
    }
  };

  const handleSubmit = async () => {
    if (!task || !canEdit) return;
    let values: EditFormValues;
    try {
      values = await form.validateFields();
    } catch {
      message.warning('Kiểm tra lại các ô còn thiếu hoặc chưa hợp lệ trong form.');
      return;
    }

    const nextChildQuantities =
      quantityFamily.length > 0
        ? quantityFamily.map((child) => ({
            id: child.id,
            quantity: Number(values.childQuantities?.[child.id] ?? child.quantity),
          }))
        : [];

    const changedChildQuantities = nextChildQuantities.filter((row) => {
      const original = quantityFamily.find((child) => child.id === row.id);
      return original != null && Math.abs(row.quantity - original.quantity) > 1e-6;
    });

    const baselineParentQty = effectiveParentTotal ?? lockedParentTotal;
    const projectedParentQty =
      canEditSplitTotal && values.quantity != null && Number.isFinite(Number(values.quantity))
        ? Number(values.quantity)
        : (baselineParentQty ??
          sumSplitChildrenQuantity(
            nextChildQuantities.map((row) => ({ ...task, quantity: row.quantity })),
          ));

    const newChildren = (values.newChildren ?? []).filter(
      (row) =>
        (row.description ?? '').trim() ||
        (row.name ?? '').trim() ||
        (row.quantity ?? 0) > 0 ||
        row.asQa,
    );
    for (const row of newChildren) {
      if (row.asQa && (row.qaLevel == null || row.qaLevel < 1 || row.qaLevel > 5)) {
        message.warning('Chọn level QA (1–5) cho task con QA.');
        return;
      }
    }
    const newChildSum = newChildren.reduce((sum, row) => {
      if (row.asQa) return sum;
      return sum + (Number(row.quantity) || 0);
    }, 0);
    const existingSum = quantityFamily.reduce((sum, child) => {
      if (isQaSplitChildTask(child)) return sum;
      const row = nextChildQuantities.find((entry) => entry.id === child.id);
      return sum + (Number(row?.quantity ?? child.quantity) || 0);
    }, 0);
    if (quantityFamily.length > 0 && existingSum + newChildSum > projectedParentQty) {
      const overMsg = `Tổng SL các phần (${existingSum + newChildSum}) không được lớn hơn SL task cha (${projectedParentQty})`;
      form.setFields([{ name: 'newChildren', errors: [overMsg] }]);
      message.warning(overMsg);
      return;
    }

    const parentQtyChanged =
      quantityFamily.length > 0 &&
      baselineParentQty != null &&
      Math.abs(projectedParentQty - baselineParentQty) > 1e-6;

    const splitQtyPayload =
      quantityFamily.length > 0
        ? {
            ...(canEditSplitTotal &&
            splitParent &&
            (parentQtyChanged || changedChildQuantities.length > 0)
              ? { quantity: projectedParentQty }
              : {}),
            ...(changedChildQuantities.length > 0 || (splitParent && parentQtyChanged)
              ? {
                  childQuantities:
                    changedChildQuantities.length > 0
                      ? changedChildQuantities
                      : nextChildQuantities,
                }
              : {}),
          }
        : { quantity: values.quantity };

    const currentCmId = task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined;
    const cmChanged = canReassignCm && values.cmUserId && values.cmUserId !== currentCmId;

    const staffChanged =
      canReassign &&
      values.staffUserId &&
      values.staffUserId !==
        (resolveWholeAssignStaff(task)[0]?.userId ?? task.staff[0]?.userId ?? undefined);

    const needsChangeReason =
      staffChanged ||
      cmChanged ||
      newChildren.length > 0 ||
      changedChildQuantities.length > 0 ||
      (splitParent && parentQtyChanged);
    if (needsChangeReason && !(values.changeReason ?? '').trim()) {
      form.setFields([{ name: 'changeReason', errors: ['Nhập lý do thay đổi'] }]);
      message.warning('Nhập lý do thay đổi rồi bấm Lưu (ô ngay dưới task con mới).');
      return;
    }

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
          ...splitQtyPayload,
          ...(newChildren.length > 0
            ? {
                addSubtasks: newChildren.map((row) =>
                  row.asQa
                    ? {
                        name: 'QA',
                        description: (row.description ?? '').trim(),
                        quantity: Number(row.quantity) || 0,
                        staffUserId: (row.staffUserId ?? '').trim() || undefined,
                        isQa: true,
                        qaLevel: row.qaLevel,
                      }
                    : {
                        name: (row.name ?? '').trim() || defaultSplitChildName(task.taskName),
                        description: (row.description ?? '').trim(),
                        quantity: Number(row.quantity) || 0,
                        staffUserId: (row.staffUserId ?? '').trim() || undefined,
                      },
                ),
              }
            : {}),
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
          ...(needsChangeReason ? { changeReason: (values.changeReason ?? '').trim() } : {}),
        },
      },
      { onSuccess: resetAndClose },
    );
  };

  return (
    <Drawer
      title={canEdit ? 'Sửa / Đổi giao task Creative' : 'Xem task Creative'}
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
            {splitChild && task.parentTaskId ? (
              <p className={styles.contextMeta}>
                Task cha:{' '}
                <Link to={buildMyTaskDetailPath(task.parentTaskId, { from: task.id })}>
                  {inferParentTaskCodeFromSplit(task.taskCode) ?? 'mở task gốc'}
                </Link>
              </p>
            ) : null}
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
                  {splitParent || splitChild
                    ? (parentTotalFromForm ?? headerQuantity ?? '—')
                    : headerQuantity != null
                      ? headerQuantity
                      : '—'}
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

          {!canEdit ? <Alert type="warning" showIcon message={readOnlyMessage} /> : null}

          <Form
            form={form}
            layout="vertical"
            disabled={!canEdit || isPending}
            className={styles.editForm}
            scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
            onValuesChange={handleFormValuesChange}
          >
            <div className={styles.formSection}>
              {splitParent || splitChild ? (
                <div className={styles.allocationBlock}>
                  <div className={styles.allocationHeader}>
                    <span className={styles.allocationChip}>
                      {splitParent ? SPLIT_PARENT_BADGE_LABEL : SPLIT_CHILD_BADGE_LABEL}
                    </span>
                    <span
                      className={`${styles.allocationSum} ${
                        allocationWithinParent ? '' : styles.allocationSumWarn
                      }`}
                    >
                      {allocatedFromForm} / {parentTotalFromForm}
                      {allocationWithinParent ? '' : ' · vượt'}
                    </span>
                  </div>
                  <p className={styles.allocationHint}>
                    {canEditSplitTotal
                      ? splitChild
                        ? 'Đang sửa một task nhỏ trong cùng task cha. Tổng các phần (không gồm QA) không được lớn hơn SL task cha.'
                        : 'Chỉnh SL tổng hoặc từng phần. Tổng các phần scope (không gồm QA) không được lớn hơn SL task cha. Phần finished/huỷ bị khoá.'
                      : 'SL tổng do người tạo task hoặc Admin sửa. Bạn chỉ sửa số lượng từng phần; tổng scope không gồm QA.'}
                  </p>
                  <Form.Item
                    name="quantity"
                    label="SL tổng"
                    rules={[{ required: true, message: 'Nhập SL tổng' }, wholeTaskQuantityRule]}
                    extra={
                      canEditSplitTotal
                        ? undefined
                        : 'CM không sửa SL tổng. Chỉ người tạo task (PM) hoặc Admin sửa được.'
                    }
                  >
                    <InputNumber
                      min={1}
                      precision={0}
                      step={1}
                      style={{ width: '100%' }}
                      disabled={!canEdit || !canEditSplitTotal || isPending}
                      aria-label="SL tổng"
                    />
                  </Form.Item>
                  {!allocationWithinParent ? (
                    <Alert
                      type="warning"
                      showIcon
                      className={styles.banner}
                      message="Tổng SL các phần lớn hơn SL task cha"
                    />
                  ) : null}
                  {splitFamilyLoading ? (
                    <Alert
                      type="info"
                      showIcon
                      className={styles.banner}
                      message="Đang tải danh sách task nhỏ…"
                    />
                  ) : quantityFamily.length > 0 ? (
                    <>
                      {quantityFamily.map((child, index) => {
                        const qtyLocked = isSplitChildQuantityLocked(child);
                        const isQaChild = isQaSplitChildTask(child);
                        return (
                          <div className={styles.allocationRow} key={child.id}>
                            <div className={styles.allocationMeta}>
                              <p className={styles.allocationTitle}>
                                {index + 1}. {isQaChild ? `QA ${child.level}` : child.taskName}
                                {isQaChild ? (
                                  <span className={styles.qaChip}>QA · SL riêng</span>
                                ) : null}
                              </p>
                              <p className={styles.allocationSub}>
                                {child.taskCode}
                                {child.id === task.id ? ' · đang mở' : ''}
                                {child.staff[0]?.name ? ` · ${child.staff[0].name}` : ''}
                                {qtyLocked
                                  ? ` · ${CONFIRMATION_LABELS[child.staffConfirmation]}`
                                  : child.staffConfirmation === 'confirmed'
                                    ? ` · ${CONFIRMATION_LABELS.confirmed}`
                                    : ''}
                              </p>
                            </div>
                            <div className={styles.allocationQty}>
                              <Form.Item
                                name={['childQuantities', child.id]}
                                rules={
                                  qtyLocked
                                    ? undefined
                                    : [
                                        { required: true, message: 'Nhập SL' },
                                        nonNegativeWholeQuantityRule,
                                      ]
                                }
                              >
                                <InputNumber
                                  min={qtyLocked ? undefined : 0}
                                  precision={qtyLocked ? undefined : 0}
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
                      })}
                      {canAddSplitChild ? (
                        <div className={styles.newChildrenBlock}>
                          <div className={styles.newChildrenHeader}>
                            <p className={styles.sectionLabel}>Thêm task con</p>
                            <p className={styles.allocationHint}>
                              Còn {Math.max(0, parentTotalFromForm - allocatedFromForm)} SL scope
                              chưa chia. Tick QA để tạo task QA (SL riêng, không trừ SL tổng). Điền
                              brief → Lưu thay đổi.
                            </p>
                          </div>
                          <Form.List name="newChildren">
                            {(fields, { add, remove }) => (
                              <div className={styles.formSectionStack}>
                                {fields.map((field, index) => {
                                  const asQa = Boolean(watchedNewChildren?.[field.name]?.asQa);
                                  return (
                                    <div className={styles.subtaskCardCompact} key={field.key}>
                                      <div className={styles.subtaskHeader}>
                                        <span>
                                          Task con mới {index + 1}
                                          {asQa ? ' · QA' : ''}
                                        </span>
                                        <Button
                                          type="link"
                                          danger
                                          size="small"
                                          onClick={() => remove(field.name)}
                                        >
                                          Xóa
                                        </Button>
                                      </div>
                                      <Form.Item
                                        name={[field.name, 'asQa']}
                                        valuePropName="checked"
                                        className={styles.qaCheckboxItem}
                                      >
                                        <Checkbox
                                          onChange={(event) => {
                                            if (event.target.checked) {
                                              form.setFieldValue(
                                                ['newChildren', field.name, 'name'],
                                                'QA',
                                              );
                                            } else {
                                              form.setFieldValue(
                                                ['newChildren', field.name, 'name'],
                                                defaultSplitChildName(task.taskName),
                                              );
                                              form.setFieldValue(
                                                ['newChildren', field.name, 'qaLevel'],
                                                undefined,
                                              );
                                            }
                                          }}
                                        >
                                          Task QA (QA lại slide / phần của người khác)
                                        </Checkbox>
                                      </Form.Item>
                                      {asQa ? (
                                        <Form.Item
                                          name={[field.name, 'qaLevel']}
                                          label="Loại QA"
                                          rules={[{ required: true, message: 'Chọn QA 1–5' }]}
                                          extra="Type task con = QA. SL QA không tính vào SL tổng task cha."
                                        >
                                          <Select
                                            placeholder="Chọn QA 1 / 2 / …"
                                            options={
                                              qaLevelOptions.length > 0
                                                ? qaLevelOptions
                                                : [1, 2, 3, 4, 5].map((level) => ({
                                                    value: level,
                                                    label: `QA ${level}`,
                                                  }))
                                            }
                                          />
                                        </Form.Item>
                                      ) : (
                                        <Form.Item name={[field.name, 'name']} label="Tên">
                                          <Input
                                            placeholder={
                                              defaultSplitChildName(task.taskName) || 'Tên task'
                                            }
                                          />
                                        </Form.Item>
                                      )}
                                      <Form.Item
                                        name={[field.name, 'description']}
                                        label="Brief"
                                        rules={[{ required: true, message: 'Nhập brief' }]}
                                      >
                                        <Input.TextArea
                                          rows={2}
                                          placeholder={
                                            asQa
                                              ? 'Brief phần QA (slide / phần cần kiểm)…'
                                              : 'Brief phần việc của task con này…'
                                          }
                                        />
                                      </Form.Item>
                                      <div className={styles.deadlineRow}>
                                        <Form.Item
                                          name={[field.name, 'staffUserId']}
                                          label="Giao cho"
                                        >
                                          <Select
                                            showSearch
                                            allowClear
                                            optionFilterProp="label"
                                            placeholder="Chưa gán Staff"
                                            options={staffSelectOptions}
                                          />
                                        </Form.Item>
                                        <Form.Item
                                          name={[field.name, 'quantity']}
                                          label={asQa ? 'SL QA (riêng)' : 'Số lượng'}
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
                                    </div>
                                  );
                                })}
                                <Button
                                  type="dashed"
                                  block
                                  className={styles.addSubtask}
                                  onClick={() =>
                                    add({
                                      name: defaultSplitChildName(task.taskName),
                                      quantity: 0,
                                      description: '',
                                      asQa: false,
                                    })
                                  }
                                >
                                  + Thêm task con
                                </Button>
                              </div>
                            )}
                          </Form.List>
                          {(watchedNewChildren?.length ?? 0) > 0 ? (
                            <Form.Item
                              name="changeReason"
                              label="Lý do thêm / đổi"
                              rules={[{ required: true, message: 'Nhập lý do thay đổi' }]}
                              extra="Bắt buộc khi thêm task con. Sau đó bấm Lưu thay đổi ở cuối drawer."
                            >
                              <Input.TextArea
                                rows={2}
                                placeholder="Ví dụ: bổ sung phần còn lại cho Staff khác"
                              />
                            </Form.Item>
                          ) : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <Alert
                      type="warning"
                      showIcon
                      className={styles.banner}
                      message={
                        splitFamilyError ? 'Không tải được danh sách task nhỏ' : 'Chưa có task nhỏ'
                      }
                      description="Đóng drawer rồi mở lại, hoặc mở từng task nhỏ từ My Tasks."
                    />
                  )}
                </div>
              ) : (
                <div className={styles.formSectionStack}>
                  <CreativeAssignModeSection task={task} allTasks={allTasks} />
                  <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={
                      quantityRequired
                        ? [{ required: true, message: 'CM nhập số lượng' }, wholeTaskQuantityRule]
                        : undefined
                    }
                    extra={
                      stage === 'awaiting_cm' || stage === 'awaiting_ch'
                        ? 'SL task cha do người tạo task hoặc Admin sửa.'
                        : quantityRequired
                          ? 'Task Creative: CM điền / chỉnh số lượng.'
                          : 'CM sẽ nhập số lượng khi giao Staff.'
                    }
                  >
                    <InputNumber
                      min={1}
                      precision={0}
                      step={1}
                      style={{ width: '100%' }}
                      disabled={
                        !canEdit ||
                        isPending ||
                        ((stage === 'awaiting_cm' || stage === 'awaiting_ch') && !canEditSplitTotal)
                      }
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
                {(watchedNewChildren?.length ?? 0) === 0 ? (
                  <Form.Item
                    name="changeReason"
                    label="Lý do thay đổi"
                    extra="Bắt buộc khi đổi SL các phần hoặc đổi người được giao."
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Ví dụ: giảm SL A để gán phần còn lại cho C"
                    />
                  </Form.Item>
                ) : null}
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
                    label={
                      <CreativeDeadlineFieldLabel>Creative deadline</CreativeDeadlineFieldLabel>
                    }
                    className={styles.deadlineField}
                    extra={
                      !canEditCreativeDl
                        ? role === ROLES.CREATIVE_MANAGER
                          ? 'CM chỉ sửa creative deadline sau khi đã giao Staff.'
                          : CREATIVE_DEADLINE_META_EDIT_HINT
                        : creativeDeadlineFieldExtra(creativeAfterPm)
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
                        {!canEditLevel && !levelLocked ? (
                          <Alert
                            type="info"
                            showIcon
                            className={styles.banner}
                            message="Creative Manager không được đổi Level. Admin, Creative Head hoặc Head đổi được."
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
