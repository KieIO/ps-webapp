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
import { useEffect, useMemo, useRef, useState } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import type { ProjectUrgency } from '@/features/projects/schemas/project.schema';
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
import {
  hasCreateTaskDraftChanges,
  snapshotCreateTaskDraft,
  type CreateTaskDraftSnapshot,
} from '../../utils/createTaskDraft';
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
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
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
  urgency: ProjectUrgency;
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
  urgency: 'auto',
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
      <p className={styles.sectionLabel}>Chọn loại task</p>
      <button type="button" className={styles.card} onClick={() => onSelect('project')}>
        <span className={styles.cardIcon}>
          <FolderKanban size={16} />
        </span>
        <span>
          <span className={styles.cardTitle}>Project Task</span>
          <span className={styles.cardSub}>
            Bạn viết brief và phân loại Level, rồi giao Project Staff hoặc chuyển sang Creative.
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
            Chưa cần brief. Creative Head sẽ bổ sung brief, phân loại Level và giao CM.
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
            Giao trực tiếp cho Project Staff. Brief đã sẵn đi kèm task.
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
            Chuyển sang Creative kèm brief. Creative Head chỉ cần giao CM.
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
  const draftBaselineRef = useRef<CreateTaskDraftSnapshot | null>(null);
  const { mutate, isPending } = useCreateMyTask();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isProjectWorkflow = workflowKind === 'project';
  const hasKind = workflowKind != null;

  const { data: projectOptions = [] } = useCreateTaskProjectOptions('project', open);
  const { data: pmOptions = [] } = useCreateTaskPmOptions(open);
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
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
    const filtered = scoreItems.filter((score) => score.department === scoreDepartment);
    return filtered.map((score) => ({ value: score.name, label: score.name }));
  }, [scoreItems, scoreDepartment]);

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
      label: pm.name,
    }));
    if (
      defaultProjectManager?.code &&
      !options.some((option) => option.value === defaultProjectManager.code)
    ) {
      options.unshift({
        value: defaultProjectManager.code,
        label: defaultProjectManager.name,
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

  const captureDraftBaseline = () => {
    draftBaselineRef.current = snapshotCreateTaskDraft(form.getFieldsValue(true));
  };

  useEffect(() => {
    if (!open) {
      draftBaselineRef.current = null;
      return;
    }
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
    captureDraftBaseline();
  }, [open, form, preset, defaultProjectManager]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue('taskType', derivedTaskType);
  }, [open, derivedTaskType, form]);

  const resetAndClose = () => {
    setWorkflowKind(null);
    setStep(0);
    draftBaselineRef.current = null;
    form.resetFields();
    onClose();
  };

  const handleCloseRequest = () => {
    if (isPending) return;
    const currentDraft = snapshotCreateTaskDraft(form.getFieldsValue(true));
    if (hasCreateTaskDraftChanges(draftBaselineRef.current, currentDraft)) {
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
            'urgency',
            'description',
            'designThinking',
            'technical',
            'contentProcessing',
          ]
        : ['projectName', ['projectManager', 'code'], 'taskScoreName', 'date', 'urgency'];
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
    captureDraftBaseline();
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
    ? [{ title: 'Brief' }, { title: 'Hướng giao' }, { title: 'Xác nhận' }]
    : [{ title: 'Tạo task' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }];

  const primaryLabel =
    step < LAST_STEP
      ? 'Tiếp tục'
      : isProjectWorkflow && assignDirection === 'project_staff'
        ? 'Giao task'
        : 'Gửi Creative';

  const briefFilled = Boolean(description?.trim());
  const summaryDeadline = date ? dayjs(toTaskDeadline(date)).format(DATETIME_SHORT_FORMAT) : '—';

  return (
    <Drawer
      title="Tạo task mới"
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
            size="small"
            requiredMark
            className={styles.form}
            initialValues={DEFAULT_VALUES}
          >
            <div hidden={step !== 0}>
              <div className={styles.row}>
                <Form.Item
                  name="projectName"
                  label="Tên dự án"
                  rules={[{ required: true, message: 'Nhập tên dự án' }]}
                >
                  <AutoComplete
                    options={projectOptions.map((name) => ({ value: name }))}
                    placeholder="Chọn hoặc nhập tên dự án"
                    disabled={Boolean(preset?.lockProject)}
                    filterOption={(input, option) =>
                      (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  name={['projectManager', 'code']}
                  label="PM"
                  rules={[{ required: true, message: 'Chọn PM' }]}
                >
                  <Select
                    allowClear
                    placeholder="Chọn PM"
                    onChange={handlePmSelect}
                    options={pmSelectOptions}
                  />
                </Form.Item>
              </div>
              <Form.Item name={['projectManager', 'name']} hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="taskScoreName"
                label="Tên task"
                rules={[{ required: true, message: 'Chọn tên task' }]}
                extra={derivedTaskType ? `Loại: ${derivedTaskType}` : undefined}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn tên task..."
                  options={taskScoreOptions}
                  loading={scoresLoading}
                  optionFilterProp="label"
                  onChange={handleTaskScoreChange}
                />
              </Form.Item>
              <Form.Item name="taskType" hidden>
                <Input />
              </Form.Item>

              {isProjectWorkflow ? (
                <>
                  <div className={styles.rowThree}>
                    <Form.Item
                      name="quantity"
                      label="Số lượng"
                      rules={[{ required: true, message: 'Nhập số lượng' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      name="date"
                      label="Deadline"
                      rules={[{ required: true, message: 'Chọn deadline' }]}
                    >
                      <DatePicker
                        showTime={{
                          format: 'HH:mm',
                          defaultValue: dayjs().second(0).millisecond(0),
                        }}
                        format={DATETIME_SHORT_FORMAT}
                        style={{ width: '100%' }}
                        placeholder="Ngày & giờ"
                        showNow={false}
                      />
                    </Form.Item>
                    <Form.Item
                      name="urgency"
                      label={MY_TASK_COLUMN_HEADERS.urgency}
                      rules={[{ required: true, message: 'Chọn mức ưu tiên' }]}
                    >
                      <TaskUrgencySelect />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="description"
                    label="Brief"
                    rules={[{ required: true, message: 'Nhập brief' }]}
                  >
                    <Input.TextArea rows={2} placeholder="Mô tả công việc, yêu cầu kỹ thuật..." />
                  </Form.Item>

                  <p className={styles.sectionLabel}>
                    Phân loại độ khó
                    {computedLevel != null ? ` · Level ${computedLevel}` : ''}
                  </p>
                  <div className={styles.criteria}>
                    <Form.Item
                      name="designThinking"
                      label={MY_TASK_COLUMN_HEADERS.designThinking}
                      rules={[{ required: true, message: 'Chọn mức' }]}
                      className={styles.criterionItem}
                    >
                      <ClassificationScale />
                    </Form.Item>
                    <Form.Item
                      name="technical"
                      label={MY_TASK_COLUMN_HEADERS.technical}
                      rules={[{ required: true, message: 'Chọn mức' }]}
                      className={styles.criterionItem}
                    >
                      <ClassificationScale />
                    </Form.Item>
                    <Form.Item
                      name="contentProcessing"
                      label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                      rules={[{ required: true, message: 'Chọn mức' }]}
                      className={styles.criterionItem}
                    >
                      <ClassificationScale />
                    </Form.Item>
                  </div>
                </>
              ) : (
                <div className={styles.row}>
                  <Form.Item
                    name="date"
                    label="Deadline"
                    rules={[{ required: true, message: 'Chọn deadline' }]}
                  >
                    <DatePicker
                      showTime={{
                        format: 'HH:mm',
                        defaultValue: dayjs().second(0).millisecond(0),
                      }}
                      format={DATETIME_SHORT_FORMAT}
                      style={{ width: '100%' }}
                      placeholder="Ngày & giờ"
                      showNow={false}
                    />
                  </Form.Item>
                  <Form.Item
                    name="urgency"
                    label={MY_TASK_COLUMN_HEADERS.urgency}
                    rules={[{ required: true, message: 'Chọn mức ưu tiên' }]}
                  >
                    <TaskUrgencySelect />
                  </Form.Item>
                </div>
              )}
            </div>

            <div hidden={step !== 1}>
              {isProjectWorkflow ? (
                <>
                  <div className={styles.summaryBar}>
                    <span>{derivedTaskType || 'Task'}</span>
                    <span>Level {computedLevel ?? '—'}</span>
                    <span>SL {quantity ?? '—'}</span>
                    <span>{date ? dayjs(date).format('DD/MM') : '—'}</span>
                    <span>{briefFilled ? 'Có brief' : 'Chưa brief'}</span>
                  </div>
                  <p className={styles.sectionLabel}>Ai sẽ thực hiện?</p>
                  <Form.Item
                    name="assignDirection"
                    rules={[{ required: true, message: 'Chọn hướng giao' }]}
                  >
                    <AssignDirectionCards />
                  </Form.Item>

                  {assignDirection === 'project_staff' ? (
                    <>
                      <Form.Item
                        name="staffUserId"
                        label="Giao cho"
                        rules={[{ required: true, message: 'Chọn nhân viên' }]}
                        extra="Không chọn được khi Overloaded hoặc nghỉ phép."
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="Chọn Project Staff"
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
                      <Alert
                        className={styles.info}
                        type="info"
                        showIcon
                        message="Staff có 15 phút để confirm sau khi nhận task."
                      />
                    </>
                  ) : null}

                  {assignDirection === 'creative_department' ? (
                    <Alert
                      className={styles.info}
                      type="info"
                      showIcon
                      message="Mọi Creative Head nhận thông báo. Ai giao trước sẽ khóa task cho CM."
                    />
                  ) : null}
                </>
              ) : (
                <div className={`${styles.banner} ${styles.bannerCreative}`}>
                  Creative Task chưa cần brief. Creative Head sẽ bổ sung brief, phân loại Level và
                  giao CM. Mọi CH đều nhận thông báo.
                </div>
              )}
            </div>

            <div hidden={step !== 2}>
              <p className={styles.sectionLabel}>Xác nhận trước khi tạo</p>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Loại</dt>
                  <dd>{isProjectWorkflow ? 'Project Task' : 'Creative Task'}</dd>
                </div>
                <div>
                  <dt>Dự án</dt>
                  <dd>{projectName || '—'}</dd>
                </div>
                <div>
                  <dt>PM</dt>
                  <dd>{projectManager?.name ? projectManager.name : '—'}</dd>
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
                    <dd>Chưa có — Creative Head sẽ bổ sung</dd>
                  </div>
                )}
                <div>
                  <dt>Deadline</dt>
                  <dd>{summaryDeadline}</dd>
                </div>
                <div>
                  <dt>Hướng giao</dt>
                  <dd>
                    {assignDirection === 'project_staff'
                      ? `Phòng Project → ${selectedStaff?.name ?? '—'}`
                      : 'Phòng Creative → Creative Head'}
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
