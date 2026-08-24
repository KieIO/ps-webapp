import {
  Alert,
  AutoComplete,
  Avatar,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Steps,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { FolderKanban, Palette } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { useTaskScoreGroupOptions } from '@/features/task-scores/hooks/useTaskScoreGroupOptions';
import { useTaskScoreList } from '@/features/task-scores/hooks/useTaskScoreList';
import { resolveTaskType } from '@/features/task-scores/utils/resolveTaskType';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { getInitials } from '@/shared/utils/person';
import { MY_TASK_COLUMN_HEADERS } from '../../constants';
import {
  useCreateTaskPmOptions,
  useCreateTaskProjectOptions,
  useCreateTaskStaffOptions,
} from '../../hooks/useCreateTaskOptions';
import { useCreateMyTask } from '../../hooks/useCreateMyTask';
import {
  buildCreateTaskPayload,
  CreateTaskPayloadError,
  resolveMatchedScore,
} from '../../utils/buildCreateTaskPayload';
import { defaultTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  isStaffAssignable,
  STAFF_AVAILABILITY_LABELS,
  staffMatchesDepartment,
} from '../../utils/staffAvailability';
import type {
  AssignDirection,
  StaffAvailability,
  TaskPerson,
  TaskWorkflowKind,
} from '../../schemas/task.schema';
import { ClassificationScale } from './ClassificationScale';
import styles from './CreateTaskDrawer.module.scss';

const EMPTY_SCORE_FILTERS = {};
const LAST_STEP = 2;

const PM_NAME_AUTO_SELECT_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.HEAD,
  ROLES.PM,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MANAGER,
];

export interface CreateTaskDrawerPreset {
  projectName?: string;
  projectManager?: TaskPerson;
  date?: Dayjs;
  description?: string;
  lockProject?: boolean;
}

interface CreateTaskDrawerProps {
  open: boolean;
  onClose: () => void;
  preset?: CreateTaskDrawerPreset;
  onCreated?: (taskId: string) => void;
}

type CreateTaskFormValues = {
  projectName: string;
  projectManager: TaskPerson;
  taskScoreName?: string;
  taskType?: string;
  quantity: number;
  date: Dayjs;
  description: string;
  designThinking?: number;
  technical?: number;
  contentProcessing?: number;
  assignDirection?: AssignDirection;
  staffUserId?: string;
  staffNote: string;
};

const DEFAULT_VALUES: CreateTaskFormValues = {
  projectName: '',
  projectManager: { code: '', name: '' },
  taskScoreName: undefined,
  taskType: '',
  quantity: 1,
  date: defaultTaskDeadline(),
  description: '',
  designThinking: undefined,
  technical: undefined,
  contentProcessing: undefined,
  assignDirection: undefined,
  staffUserId: undefined,
  staffNote: '',
};

const codeFromDisplayName = (name: string): string => {
  const slug = name.trim().toUpperCase().replace(/\s+/g, '.');
  return slug || 'PM';
};

const AVAILABILITY_DOT: Record<StaffAvailability, string> = {
  free: styles.dotFree,
  normal: styles.dotNormal,
  overloaded: styles.dotOverloaded,
  on_leave: styles.dotLeave,
};

function WorkflowKindCards({ onSelect }: { onSelect: (kind: TaskWorkflowKind) => void }) {
  return (
    <div className={styles.cards}>
      <p className={styles.sectionLabel}>Đây là loại task nào?</p>
      <button type="button" className={styles.card} onClick={() => onSelect('project')}>
        <span className={styles.cardIcon}>
          <FolderKanban size={16} />
        </span>
        <span>
          <span className={styles.cardTitle}>Project Task</span>
          <span className={styles.cardSub}>
            PM fill brief và phân loại Level, rồi giao Project Staff hoặc chuyển Creative kèm brief.
          </span>
        </span>
      </button>
      <button type="button" className={styles.card} onClick={() => onSelect('creative')}>
        <span className={styles.cardIcon}>
          <Palette size={16} />
        </span>
        <span>
          <span className={styles.cardTitle}>Creative Task</span>
          <span className={styles.cardSub}>
            PM không fill brief. Chuyển cho Creative Head — CH sẽ fill brief, phân loại Level và
            assign CM.
          </span>
        </span>
      </button>
    </div>
  );
}

function AssignDirectionCards({
  value,
  onChange,
}: {
  value?: AssignDirection;
  onChange?: (value: AssignDirection) => void;
}) {
  return (
    <div className={styles.cards}>
      <button
        type="button"
        className={`${styles.card} ${value === 'project_staff' ? styles.cardSelected : ''}`}
        onClick={() => onChange?.('project_staff')}
      >
        <span className={styles.cardIcon}>
          <FolderKanban size={16} />
        </span>
        <span>
          <span className={styles.cardTitle}>Phòng Project</span>
          <span className={styles.cardSub}>
            Giao trực tiếp cho Project Staff. Brief đã fill sẵn đi kèm task.
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`${styles.card} ${value === 'creative_department' ? styles.cardSelected : ''}`}
        onClick={() => onChange?.('creative_department')}
      >
        <span className={styles.cardIcon}>
          <Palette size={16} />
        </span>
        <span>
          <span className={styles.cardTitle}>Phòng Creative</span>
          <span className={styles.cardSub}>
            Chuyển sang Creative Department. Brief đã fill sẵn — CH chỉ cần assign cho CM.
          </span>
        </span>
      </button>
    </div>
  );
}

export function CreateTaskDrawer({ open, onClose, preset, onCreated }: CreateTaskDrawerProps) {
  const [form] = Form.useForm<CreateTaskFormValues>();
  const [workflowKind, setWorkflowKind] = useState<TaskWorkflowKind | null>(null);
  const [step, setStep] = useState(0);
  const { mutate, isPending } = useCreateMyTask();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isProjectWorkflow = workflowKind === 'project';
  const hasKind = workflowKind != null;

  const { data: projectOptions = [] } = useCreateTaskProjectOptions('project', open);
  const { data: pmOptions = [] } = useCreateTaskPmOptions(open);
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { groupByCode } = useTaskScoreGroupOptions({ enabled: open });
  const { data: scoreList, isLoading: scoresLoading } = useTaskScoreList(EMPTY_SCORE_FILTERS, {
    enabled: open,
  });

  const taskScoreName = Form.useWatch('taskScoreName', form);
  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const assignDirection = Form.useWatch('assignDirection', form);
  const staffUserId = Form.useWatch('staffUserId', form);
  const quantity = Form.useWatch('quantity', form);
  const date = Form.useWatch('date', form);
  const description = Form.useWatch('description', form);
  const projectName = Form.useWatch('projectName', form);
  const projectManager = Form.useWatch('projectManager', form);

  const scoreItems = useMemo(() => scoreList?.items ?? [], [scoreList?.items]);
  const scoreDepartment = workflowKind === 'creative' ? 'creative' : 'project';

  const taskScoreOptions = useMemo(() => {
    const filtered = scoreItems.filter((score) => {
      const department = groupByCode[score.group]?.department;
      return !department || department === scoreDepartment;
    });
    return filtered.map((score) => ({ value: score.name, label: score.name }));
  }, [scoreItems, groupByCode, scoreDepartment]);

  const selectedScore = useMemo(
    () => resolveMatchedScore(taskScoreName, scoreItems),
    [taskScoreName, scoreItems],
  );
  const derivedTaskType = selectedScore
    ? resolveTaskType(selectedScore.taskType, selectedScore.name)
    : '';
  const computedLevel =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : undefined;

  const defaultProjectManager = useMemo((): TaskPerson | undefined => {
    if (!currentUser?.id || !currentUser.role) return undefined;
    if (!PM_NAME_AUTO_SELECT_ROLES.includes(currentUser.role as Role)) return undefined;

    const match = pmOptions.find(
      (entry) =>
        entry.userId === currentUser.id ||
        entry.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase(),
    );
    if (match) {
      return { code: match.code, name: match.name, userId: match.userId ?? currentUser.id };
    }
    return {
      code: codeFromDisplayName(currentUser.name),
      name: currentUser.name,
      userId: currentUser.id,
    };
  }, [currentUser, pmOptions]);

  const pmSelectOptions = useMemo(() => {
    const options = pmOptions.map((pm) => ({
      value: pm.code,
      label: `${pm.code} — ${pm.name}`,
    }));
    if (
      defaultProjectManager?.code &&
      !options.some((option) => option.value === defaultProjectManager.code)
    ) {
      options.unshift({
        value: defaultProjectManager.code,
        label: `${defaultProjectManager.code} — ${defaultProjectManager.name}`,
      });
    }
    return options;
  }, [pmOptions, defaultProjectManager]);

  const projectStaffOptions = useMemo(
    () =>
      staffOptions
        .filter((staff) => staffMatchesDepartment(staff, 'project'))
        .map((staff) => {
          const availability = staff.availability;
          const assignable = isStaffAssignable(availability);
          return {
            value: staff.userId ?? staff.code,
            label: staff.name,
            disabled: !assignable,
            staff,
          };
        }),
    [staffOptions],
  );

  const selectedStaff = useMemo(
    () => projectStaffOptions.find((option) => option.value === staffUserId)?.staff,
    [projectStaffOptions, staffUserId],
  );

  useEffect(() => {
    if (!open) return;
    setWorkflowKind(null);
    setStep(0);
    form.setFieldsValue({
      ...DEFAULT_VALUES,
      date: preset?.date ?? defaultTaskDeadline(),
      projectName: preset?.projectName ?? DEFAULT_VALUES.projectName,
      projectManager:
        preset?.projectManager ?? defaultProjectManager ?? DEFAULT_VALUES.projectManager,
      description: preset?.description ?? DEFAULT_VALUES.description,
      assignDirection: undefined,
    });
  }, [open, form, preset, defaultProjectManager]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue('taskType', derivedTaskType);
  }, [open, derivedTaskType, form]);

  const resetAndClose = () => {
    setWorkflowKind(null);
    setStep(0);
    form.resetFields();
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    if (hasKind || step > 0 || form.isFieldsTouched()) {
      Modal.confirm({
        title: 'Hủy tạo task?',
        content: 'Thông tin đã nhập sẽ không được lưu.',
        okText: 'Hủy tạo',
        cancelText: 'Tiếp tục',
        okButtonProps: { danger: true },
        onOk: resetAndClose,
      });
      return;
    }
    resetAndClose();
  };

  const handlePmSelect = (pmCode: string | undefined) => {
    if (!pmCode) {
      form.setFieldValue('projectManager', { code: '', name: '' });
      return;
    }
    const pm =
      pmOptions.find((entry) => entry.code === pmCode) ??
      (defaultProjectManager?.code === pmCode ? defaultProjectManager : undefined);
    if (pm) {
      form.setFieldValue('projectManager', {
        code: pm.code,
        name: pm.name,
        userId: pm.userId,
      });
    }
  };

  const handleTaskScoreChange = (name: string | null) => {
    if (!name) {
      form.setFieldsValue({ taskType: '' });
      return;
    }
    const score = resolveMatchedScore(name, scoreItems);
    form.setFieldValue('taskType', score ? resolveTaskType(score.taskType, score.name) : '');
  };

  useEffect(() => {
    if (assignDirection !== 'project_staff') {
      form.setFieldValue('staffUserId', undefined);
    }
  }, [assignDirection, form]);

  const stepFields = (current: number): Array<keyof CreateTaskFormValues | (string | number)[]> => {
    if (current === 0) {
      return isProjectWorkflow
        ? [
            'projectName',
            ['projectManager', 'code'],
            'taskScoreName',
            'quantity',
            'date',
            'description',
            'designThinking',
            'technical',
            'contentProcessing',
          ]
        : ['projectName', ['projectManager', 'code'], 'taskScoreName', 'date'];
    }
    if (current === 1 && isProjectWorkflow) {
      return assignDirection === 'project_staff'
        ? ['assignDirection', 'staffUserId']
        : ['assignDirection'];
    }
    return [];
  };

  const selectKind = (kind: TaskWorkflowKind) => {
    setWorkflowKind(kind);
    setStep(0);
    form.setFieldsValue({
      assignDirection: kind === 'creative' ? 'creative_department' : undefined,
      staffUserId: undefined,
    });
  };

  const goNext = async () => {
    try {
      await form.validateFields(stepFields(step));
      if (step === 0 && isProjectWorkflow && !computedLevel) {
        form.setFields([
          { name: 'designThinking', errors: ['Chọn đủ 3 tiêu chí'] },
          { name: 'technical', errors: ['Chọn đủ 3 tiêu chí'] },
          { name: 'contentProcessing', errors: ['Chọn đủ 3 tiêu chí'] },
        ]);
        return;
      }
      setStep((current) => Math.min(current + 1, LAST_STEP));
    } catch {
      /* antd surfaces field errors */
    }
  };

  const goBack = () => {
    if (step === 0) {
      setWorkflowKind(null);
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    if (!workflowKind) return;
    try {
      const values = await form.validateFields();
      const payload = buildCreateTaskPayload({
        workflowKind,
        values,
        scores: scoreItems,
        staffOptions,
      });
      mutate(payload, {
        onSuccess: (created) => {
          resetAndClose();
          onCreated?.(created.id);
        },
      });
    } catch (error) {
      if (error instanceof CreateTaskPayloadError) {
        form.setFields([{ name: 'taskScoreName', errors: [error.message] }]);
      }
    }
  };

  const stepItems = isProjectWorkflow
    ? [{ title: 'Fill Brief' }, { title: 'Chọn hướng' }, { title: 'Hoàn tất' }]
    : [{ title: 'Tạo task' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }];

  const primaryLabel =
    step < LAST_STEP
      ? step === 0
        ? isProjectWorkflow
          ? 'Tiếp theo: Chọn hướng assign'
          : 'Tiếp theo'
        : 'Tiếp theo: Hoàn tất'
      : isProjectWorkflow && assignDirection === 'project_staff'
        ? 'Giao task'
        : 'Chuyển sang Creative';

  const briefFilled = Boolean(description?.trim());
  const summaryDeadline = date ? dayjs(toTaskDeadline(date)).format(DATETIME_SHORT_FORMAT) : '—';

  return (
    <Drawer
      title="Tạo Task Mới"
      open={open}
      onClose={handleCloseRequest}
      width={480}
      destroyOnHidden
      maskClosable={!isPending}
      footer={
        hasKind ? (
          <div className={styles.footer}>
            <Button onClick={goBack} disabled={isPending}>
              Quay lại
            </Button>
            <Button
              type="primary"
              loading={isPending}
              onClick={() => void (step < LAST_STEP ? goNext() : handleSubmit())}
            >
              {primaryLabel}
            </Button>
          </div>
        ) : null
      }
    >
      <div className={styles.root}>
        <div hidden={hasKind}>
          <WorkflowKindCards onSelect={selectKind} />
        </div>

        <div hidden={!hasKind}>
          <Steps
            className={styles.steps}
            size="small"
            current={step}
            items={stepItems}
            onChange={(next) => {
              if (next < step) setStep(next);
            }}
          />

          <Form
            form={form}
            layout="vertical"
            requiredMark
            className={styles.form}
            initialValues={DEFAULT_VALUES}
          >
            <div hidden={step !== 0}>
              <Form.Item
                name="projectName"
                label={MY_TASK_COLUMN_HEADERS.projectName}
                rules={[{ required: true, message: 'Project name is required' }]}
              >
                <AutoComplete
                  options={projectOptions.map((name) => ({ value: name }))}
                  placeholder="Select or enter project name"
                  disabled={Boolean(preset?.lockProject)}
                  filterOption={(input, option) =>
                    (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name={['projectManager', 'code']}
                label={MY_TASK_COLUMN_HEADERS.projectManager}
                rules={[{ required: true, message: 'Project manager is required' }]}
              >
                <Select
                  allowClear
                  placeholder="Select PM"
                  onChange={handlePmSelect}
                  options={pmSelectOptions}
                />
              </Form.Item>
              <Form.Item name={['projectManager', 'name']} hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="taskScoreName"
                label="Tên task"
                rules={[{ required: true, message: 'Task name is required' }]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Nhập tên task..."
                  options={taskScoreOptions}
                  loading={scoresLoading}
                  optionFilterProp="label"
                  onChange={handleTaskScoreChange}
                />
              </Form.Item>
              <Form.Item name="taskType" label="Task type">
                <Input disabled placeholder="Auto from task name" />
              </Form.Item>

              {isProjectWorkflow ? (
                <>
                  <div className={styles.row}>
                    <Form.Item
                      name="quantity"
                      label="Số lượng"
                      rules={[{ required: true, message: 'Quantity is required' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      name="date"
                      label="Deadline"
                      rules={[{ required: true, message: 'Deadline is required' }]}
                    >
                      <DatePicker
                        showTime={{
                          format: 'HH:mm',
                          defaultValue: dayjs().second(0).millisecond(0),
                        }}
                        format={DATETIME_SHORT_FORMAT}
                        style={{ width: '100%' }}
                        placeholder="Chọn ngày và giờ"
                        showNow={false}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="description"
                    label="Mô tả & yêu cầu"
                    rules={[{ required: true, message: 'Brief is required' }]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Mô tả chi tiết công việc, yêu cầu kỹ thuật..."
                    />
                  </Form.Item>

                  <p className={styles.sectionLabel}>Phân loại độ khó</p>
                  <Form.Item
                    name="designThinking"
                    label={MY_TASK_COLUMN_HEADERS.designThinking}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <ClassificationScale />
                  </Form.Item>
                  <Form.Item
                    name="technical"
                    label={MY_TASK_COLUMN_HEADERS.technical}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <ClassificationScale />
                  </Form.Item>
                  <Form.Item
                    name="contentProcessing"
                    label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <ClassificationScale />
                  </Form.Item>
                  <div className={styles.levelBox}>Level task dự kiến: {computedLevel ?? '—'}</div>
                  <p className={styles.note}>Brief này sẽ đi kèm task dù assign cho phòng nào.</p>
                </>
              ) : (
                <Form.Item
                  name="date"
                  label="Deadline"
                  rules={[{ required: true, message: 'Deadline is required' }]}
                >
                  <DatePicker
                    showTime={{
                      format: 'HH:mm',
                      defaultValue: dayjs().second(0).millisecond(0),
                    }}
                    format={DATETIME_SHORT_FORMAT}
                    style={{ width: '100%' }}
                    placeholder="Chọn ngày và giờ"
                    showNow={false}
                  />
                </Form.Item>
              )}
            </div>

            <div hidden={step !== 1}>
              {isProjectWorkflow ? (
                <>
                  <div className={styles.summaryBar}>
                    {derivedTaskType || 'Task'} | Level {computedLevel ?? '—'} | {quantity ?? '—'} |{' '}
                    {date ? dayjs(date).format('DD/MM') : '—'} | Brief:{' '}
                    {briefFilled ? '✓ Đã fill' : '—'}
                  </div>
                  <p className={styles.sectionLabel}>Task này sẽ được thực hiện bởi:</p>
                  <Form.Item
                    name="assignDirection"
                    rules={[{ required: true, message: 'Chọn hướng assign' }]}
                  >
                    <AssignDirectionCards />
                  </Form.Item>
                  <p className={styles.warn}>
                    Nếu đây là Creative Task thuần (PM không fill brief), quay lại và chọn Creative
                    Task.
                  </p>

                  {assignDirection === 'project_staff' ? (
                    <>
                      <Form.Item
                        name="staffUserId"
                        label="Giao cho nhân viên"
                        rules={[{ required: true, message: 'Select a staff member' }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="Chọn nhân viên"
                          options={projectStaffOptions}
                          optionRender={(option) => {
                            const availability = (
                              option.data as { staff?: { availability?: StaffAvailability } }
                            ).staff?.availability;
                            return (
                              <span className={styles.staffOption}>
                                <Avatar size={22}>{getInitials(String(option.label ?? ''))}</Avatar>
                                <span>{option.label}</span>
                                {availability ? (
                                  <span className={styles.staffMeta}>
                                    <span
                                      className={`${styles.dot} ${AVAILABILITY_DOT[availability]}`}
                                    />
                                    {STAFF_AVAILABILITY_LABELS[availability]}
                                  </span>
                                ) : null}
                              </span>
                            );
                          }}
                        />
                      </Form.Item>
                      <p className={styles.note}>Overloaded / nghỉ phép không thể chọn.</p>
                      <Alert
                        className={styles.info}
                        type="info"
                        showIcon
                        message="Nhân viên có 15 phút để confirm sau khi nhận task."
                      />
                    </>
                  ) : null}

                  {assignDirection === 'creative_department' ? (
                    <Alert
                      className={styles.info}
                      type="info"
                      showIcon
                      message="Toàn bộ Creative Head sẽ nhận được thông báo. Ai trong số họ cũng có thể assign task cho CM."
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <div className={`${styles.banner} ${styles.bannerCreative}`}>
                    Creative Task — Chưa có brief. PM không fill brief. Creative Head sẽ fill brief
                    và phân loại Task Level sau khi nhận.
                  </div>
                  <div className={`${styles.banner} ${styles.bannerNotify}`}>
                    Toàn bộ Creative Head sẽ nhận được thông báo này. Ai trong số họ cũng có thể
                    assign task cho CM.
                  </div>
                </>
              )}
            </div>

            <div hidden={step !== 2}>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Loại</dt>
                  <dd>{isProjectWorkflow ? 'Project Task' : 'Creative Task'}</dd>
                </div>
                <div>
                  <dt>Project</dt>
                  <dd>{projectName || '—'}</dd>
                </div>
                <div>
                  <dt>PM</dt>
                  <dd>
                    {projectManager?.name ? `${projectManager.code} — ${projectManager.name}` : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Tên task</dt>
                  <dd>{derivedTaskType || taskScoreName || '—'}</dd>
                </div>
                {isProjectWorkflow ? (
                  <>
                    <div>
                      <dt>Brief</dt>
                      <dd>{description?.trim() || '—'}</dd>
                    </div>
                    <div>
                      <dt>Level</dt>
                      <dd>{computedLevel ?? '—'}</dd>
                    </div>
                    <div>
                      <dt>Số lượng</dt>
                      <dd>{quantity ?? '—'}</dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt>Brief</dt>
                    <dd>Chưa có — Creative Head sẽ fill</dd>
                  </div>
                )}
                <div>
                  <dt>Deadline</dt>
                  <dd>{summaryDeadline}</dd>
                </div>
                <div>
                  <dt>Hướng assign</dt>
                  <dd>
                    {assignDirection === 'project_staff'
                      ? `Phòng Project → ${selectedStaff?.name ?? '—'}`
                      : 'Phòng Creative (mọi Creative Head nhận task)'}
                  </dd>
                </div>
              </dl>
            </div>
          </Form>
        </div>
      </div>
    </Drawer>
  );
}
