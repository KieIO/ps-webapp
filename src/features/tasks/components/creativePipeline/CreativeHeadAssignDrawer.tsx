import { Alert, Button, DatePicker, Drawer, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
import { ProjectUrgencyBadge } from '@/features/projects/components/ProjectUrgencyBadge/ProjectUrgencyBadge';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import { useAssignCreativeHead } from '../../hooks/useAssignCreativeHead';
import { useAssignPickerCapacity } from '../../hooks/useAssignPickerCapacity';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useMyTaskList } from '../../hooks/useMyTaskList';
import type { MyTask } from '../../schemas/task.schema';
import { formatTaskDateTime, fromTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  canSelectAssignee,
  displayCapacityPercent,
  filterCreativeManagers,
  getAssigneeWorkload,
  isAwaitingCh,
  needsChBrief,
  resolveAssigneeAvailability,
} from '../../utils/creativePipeline';
import { getTaskDeadline } from '../../utils/taskDetail';
import { normalizeTaskUrgencySetting, resolveTaskUrgencyDisplay } from '../../utils/taskUrgency';
import { ASSIGN_OVERLOAD_CAPACITY_PERCENT } from '../../utils/staffAvailability';
import { ClassificationScale } from '../CreateTaskDrawer/ClassificationScale';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
import { AssigneeOptionLabel } from './AssigneeOptionLabel';
import styles from './creativePipeline.module.scss';

interface CreativeHeadAssignDrawerProps {
  open: boolean;
  task: MyTask | null;
  readOnly?: boolean;
  onClose: () => void;
}

type HeadFormValues = {
  description?: string;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  cmUserId?: string;
  cmNote?: string;
  creativeDeadline?: Dayjs | null;
  urgency?: ProjectUrgency;
};

const resolvePmDeadlineIso = (task: MyTask): string => getTaskDeadline(task);

export function CreativeHeadAssignDrawer({
  open,
  task,
  readOnly = false,
  onClose,
}: CreativeHeadAssignDrawerProps) {
  const [form] = Form.useForm<HeadFormValues>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { mutate, isPending } = useAssignCreativeHead();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { data: taskList } = useMyTaskList({ taskCategory: 'project' }, { enabled: open });
  const allTasks = useMemo(() => taskList?.items ?? [], [taskList?.items]);

  const creativeDeadlineWatch = Form.useWatch('creativeDeadline', form);
  const capacityTask = useMemo(() => {
    if (!task) return null;
    if (creativeDeadlineWatch?.isValid()) {
      return {
        ...task,
        creativeDeadline: toTaskDeadline(creativeDeadlineWatch),
      };
    }
    return task;
  }, [task, creativeDeadlineWatch]);

  const {
    capacityByUserId,
    periodNote,
    isLoading: capacityLoading,
    isError: capacityError,
  } = useAssignPickerCapacity(capacityTask, open);

  const fillBrief = Boolean(task && needsChBrief(task));
  const lockedBrief = Boolean(task && !needsChBrief(task));
  const canSubmit = Boolean(task && !readOnly && isAwaitingCh(task));
  const canEditUrgency = fillBrief && canSubmit;
  const canEditCreativeDeadline = fillBrief && canSubmit;

  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const computedLevel =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : task?.level;

  const pmDeadlineLabel = task ? formatTaskDateTime(resolvePmDeadlineIso(task)) : '—';
  const creativeHeadName = currentUser?.name?.trim() || '—';
  const urgencyDisplay = task ? resolveTaskUrgencyDisplay(task) : null;

  const cmOptions = useMemo(
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
    const defaultCreativeDeadline = fromTaskDeadline(
      task.creativeDeadline || resolvePmDeadlineIso(task),
    );
    form.setFieldsValue({
      description: task.description,
      designThinking: fillBrief ? undefined : task.designThinking,
      technical: fillBrief ? undefined : task.technical,
      contentProcessing: fillBrief ? undefined : task.contentProcessing,
      cmUserId: task.creativeManager?.userId ?? task.staff[0]?.userId ?? undefined,
      cmNote: task.cmNote ?? '',
      creativeDeadline: defaultCreativeDeadline,
      urgency: normalizeTaskUrgencySetting(task.urgency),
    });
  }, [open, task, fillBrief, form]);

  const resetAndClose = () => {
    form.resetFields();
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    if (!readOnly && form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy xử lý task?',
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
    if (!task) return;
    const values = await form.validateFields();
    if (!values.cmUserId) return;
    const creativeDeadline = values.creativeDeadline?.isValid()
      ? toTaskDeadline(values.creativeDeadline)
      : resolvePmDeadlineIso(task);
    mutate(
      {
        id: task.id,
        payload: {
          cmUserId: values.cmUserId,
          description: values.description,
          designThinking: values.designThinking,
          technical: values.technical,
          contentProcessing: values.contentProcessing,
          cmNote: values.cmNote,
          creativeDeadline,
          ...(fillBrief && values.urgency ? { urgency: values.urgency } : {}),
        },
      },
      { onSuccess: resetAndClose },
    );
  };

  return (
    <Drawer
      title={fillBrief ? 'Bổ sung brief & giao CM' : 'Giao cho Creative Manager'}
      open={open}
      onClose={handleCloseRequest}
      width={480}
      destroyOnHidden
      maskClosable={!isPending}
      footer={
        <div className={styles.footer}>
          <Button onClick={handleCloseRequest} disabled={isPending}>
            {canSubmit ? 'Hủy' : 'Đóng'}
          </Button>
          {canSubmit ? (
            <Button type="primary" loading={isPending} onClick={() => void handleSubmit()}>
              {fillBrief ? 'Lưu brief & giao CM' : 'Giao cho CM'}
            </Button>
          ) : null}
        </div>
      }
    >
      {task ? (
        <div className={styles.root}>
          <div className={styles.contextCard}>
            <p className={styles.contextTitle}>
              {task.taskCode} — {task.taskName}
            </p>
            <p className={styles.contextMeta}>
              {task.projectName} · {task.projectManager.name} · CH: {creativeHeadName}
              {urgencyDisplay ? (
                <>
                  {' · '}
                  <ProjectUrgencyBadge urgency={urgencyDisplay} />
                </>
              ) : null}
            </p>
          </div>

          {lockedBrief ? (
            <div className={`${styles.banner} ${styles.bannerProject}`}>
              Brief đã có từ PM — chỉ cần chọn CM.
            </div>
          ) : (
            <div className={`${styles.banner} ${styles.bannerCreative}`}>
              Chưa có brief — bổ sung mô tả, Level, rồi chọn CM.
            </div>
          )}

          <Form
            form={form}
            layout="vertical"
            size="small"
            requiredMark={fillBrief}
            className={styles.compactForm}
          >
            <div className={styles.deadlineRow}>
              <div className={styles.deadlineReadOnly}>
                <span className={styles.deadlineLabel}>Deadline gốc</span>
                <span className={styles.deadlineValue}>{pmDeadlineLabel}</span>
              </div>
              <Form.Item
                name="creativeDeadline"
                label="Deadline Creative"
                className={styles.deadlineField}
              >
                <DatePicker
                  showTime={{
                    format: 'HH:mm',
                    defaultValue: dayjs().second(0).millisecond(0),
                  }}
                  format={DATETIME_SHORT_FORMAT}
                  style={{ width: '100%' }}
                  allowClear={canEditCreativeDeadline}
                  disabled={readOnly || !canEditCreativeDeadline}
                  placeholder="Deadline nội bộ"
                  showNow={false}
                />
              </Form.Item>
            </div>

            {canEditUrgency ? (
              <Form.Item
                name="urgency"
                label={MY_TASK_COLUMN_HEADERS.urgency}
                rules={[{ required: true, message: 'Chọn mức ưu tiên' }]}
              >
                <TaskUrgencySelect disabled={readOnly} />
              </Form.Item>
            ) : null}

            {lockedBrief ? (
              <>
                <div className={styles.contextCard}>
                  <div className={styles.briefBlock}>{task.description || '—'}</div>
                  <p className={styles.contextMeta}>
                    Level {task.level} · TD {task.designThinking} · KT {task.technical} · NL{' '}
                    {task.contentProcessing}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Form.Item
                  name="description"
                  label="Brief"
                  rules={[{ required: true, message: 'Vui lòng nhập brief' }]}
                >
                  <Input.TextArea
                    rows={2}
                    disabled={readOnly}
                    placeholder="Mô tả công việc, yêu cầu kỹ thuật..."
                  />
                </Form.Item>
                <p className={styles.sectionLabel}>
                  Phân loại độ khó
                  {computedLevel != null ? ` · Level ${computedLevel}` : ''}
                </p>
                <div className={styles.compactCriteria}>
                  <Form.Item
                    name="designThinking"
                    label={MY_TASK_COLUMN_HEADERS.designThinking}
                    rules={[{ required: true, message: 'Chọn mức' }]}
                    className={styles.compactCriterion}
                  >
                    <ClassificationScale disabled={readOnly} />
                  </Form.Item>
                  <Form.Item
                    name="technical"
                    label={MY_TASK_COLUMN_HEADERS.technical}
                    rules={[{ required: true, message: 'Chọn mức' }]}
                    className={styles.compactCriterion}
                  >
                    <ClassificationScale disabled={readOnly} />
                  </Form.Item>
                  <Form.Item
                    name="contentProcessing"
                    label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                    rules={[{ required: true, message: 'Chọn mức' }]}
                    className={styles.compactCriterion}
                  >
                    <ClassificationScale disabled={readOnly} />
                  </Form.Item>
                </div>
              </>
            )}

            <Form.Item name="cmNote" label="Ghi chú cho CM">
              <Input.TextArea rows={1} disabled={readOnly} placeholder="Tùy chọn" />
            </Form.Item>

            <Form.Item
              name="cmUserId"
              label="Creative Manager"
              rules={[{ required: canSubmit, message: 'Chọn Creative Manager' }]}
              extra={
                <>
                  {periodNote}. Không giao khi capacity ≥ {ASSIGN_OVERLOAD_CAPACITY_PERCENT}%.
                  {capacityLoading ? ' Đang tải…' : null}
                  {capacityError ? ' Dùng ước lượng tạm.' : null}
                </>
              }
            >
              <Select
                showSearch
                optionFilterProp="label"
                disabled={readOnly}
                placeholder="Chọn CM theo workload"
                options={cmOptions}
                optionRender={(option) => {
                  const data = option.data as {
                    staff: (typeof cmOptions)[number]['staff'];
                    activeCount: number;
                    capacityPercent: number;
                    availability: (typeof cmOptions)[number]['availability'];
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
            {cmOptions.length === 0 ? (
              <Alert type="warning" showIcon message="Chưa có Creative Manager khả dụng." />
            ) : null}
          </Form>
        </div>
      ) : null}
    </Drawer>
  );
}
