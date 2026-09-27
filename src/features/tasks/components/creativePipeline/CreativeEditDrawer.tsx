import { Alert, Button, DatePicker, Drawer, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import { useUpdateCreativePipeline } from '../../hooks/useUpdateCreativePipeline';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import type { MyTask } from '../../schemas/task.schema';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  canChangeCreativeLevelRole,
  canEditCreativePipelineTask,
  canReassignCreativeManager,
  canReassignCreativeStaff,
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeManagers,
  filterCreativeStaff,
  getAssigneeWorkload,
  isCreativeLevelLockedByStaffConfirm,
  PIPELINE_STAGE_LABELS,
  resolveAssigneeAvailability,
  resolveEffectivePipelineStage,
  resolveWholeAssignStaff,
} from '../../utils/creativePipeline';
import { ClassificationScale } from '../CreateTaskDrawer/ClassificationScale';
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
  creativeDeadline?: dayjs.Dayjs | null;
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
  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
  } = useAssignPickerCapacity(task, open);

  const canEdit = Boolean(task && canEditCreativePipelineTask(task, role, userId));
  const canEditLevel = Boolean(task && canChangeCreativeLevelRole(role));
  const levelLocked = Boolean(task && isCreativeLevelLockedByStaffConfirm(task));
  const canReassign = Boolean(task && canReassignCreativeStaff(task, role) && canEdit);
  const canReassignCm = Boolean(task && canReassignCreativeManager(task, role) && canEdit);
  const stage = task ? resolveEffectivePipelineStage(task) : undefined;
  const quantityRequired = stage === 'assigned_staff' || stage === 'split';

  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const computedLevel =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : task?.level;

  const staffSelectOptions = useMemo(
    () =>
      filterCreativeStaff(staffOptions).map((staff) => {
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
    form.setFieldsValue({
      description: task.description,
      additionalFactors: task.additionalFactors,
      quantity: task.quantity > 0 ? task.quantity : undefined,
      creativeDeadline: task.creativeDeadline ? dayjs(task.creativeDeadline) : null,
      designThinking: task.designThinking,
      technical: task.technical,
      contentProcessing: task.contentProcessing,
      staffUserId: resolveWholeAssignStaff(task)[0]?.userId ?? undefined,
      cmUserId: task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined,
      staffNote: task.staffNote || task.cmNote || '',
    });
  }, [open, task, form]);

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

    const currentCmId = task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined;
    const cmChanged = canReassignCm && values.cmUserId && values.cmUserId !== currentCmId;

    const staffChanged =
      canReassign &&
      values.staffUserId &&
      values.staffUserId !== (resolveWholeAssignStaff(task)[0]?.userId ?? undefined);

    mutate(
      {
        id: task.id,
        payload: {
          description: values.description,
          additionalFactors: values.additionalFactors,
          quantity: values.quantity,
          creativeDeadline: values.creativeDeadline
            ? values.creativeDeadline.endOf('day').toISOString()
            : values.creativeDeadline === null
              ? ''
              : undefined,
          // Level only when Admin/CH and staff chưa confirm/finished.
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
            <p className={styles.contextMeta}>
              {task.projectName}
              {task.projectManager.name ? ` · PM: ${task.projectManager.name}` : ''}
              {stage ? ` · ${PIPELINE_STAGE_LABELS[stage]}` : ''}
              {` · Status: ${task.staffConfirmation}`}
            </p>
          </div>

          {!canEdit ? (
            <Alert type="warning" showIcon message="Bạn chỉ có thể xem task này." />
          ) : null}

          <CreativeAssignModeSection
            task={task}
            allTasks={allTasks}
            showReassignHint={canReassign}
          />

          <Form form={form} layout="vertical" disabled={!canEdit || isPending}>
            <Form.Item name="description" label="Brief / mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="additionalFactors" label="Yếu tố bổ sung">
              <Input.TextArea rows={2} />
            </Form.Item>
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
              <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="creativeDeadline" label="Creative deadline">
              <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} allowClear />
            </Form.Item>
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
