import { AutoComplete, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { useDepartmentOptions } from '@/features/departments/hooks/useDepartmentOptions';
import { useTaskScoreGroupOptions } from '@/features/task-scores/hooks/useTaskScoreGroupOptions';
import { useTaskScoreList } from '@/features/task-scores/hooks/useTaskScoreList';
import { resolveTaskType } from '@/features/task-scores/utils/resolveTaskType';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  CLASSIFICATION_LEVEL_OPTIONS,
  MY_TASK_COLUMN_HEADERS,
  UNASSIGNED_STAFF_LABEL,
} from '../../constants';
import {
  useCreateTaskPmOptions,
  useCreateTaskProjectOptions,
  useCreateTaskStaffOptions,
} from '../../hooks/useCreateTaskOptions';
import { useCreateMyTask } from '../../hooks/useCreateMyTask';
import { mergeStaffSelectOptions, resolveStaffFromUserId } from '../../utils/staff';
import { defaultTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
import { computeTaskLevel } from '../../utils/taskLevel';
import type {
  CreateMyTaskRequest,
  TaskCategory,
  TaskDepartment,
  TaskPerson,
} from '../../schemas/task.schema';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

/** Roles that pre-fill PM Name with the signed-in user when the modal opens. */
const PM_NAME_AUTO_SELECT_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.HEAD,
  ROLES.PM,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MANAGER,
];

interface CreateTaskPreset {
  projectName?: string;
  projectManager?: TaskPerson;
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  taskCategory: TaskCategory;
  preset?: CreateTaskPreset;
}

type CreateTaskFormValues = Omit<
  CreateMyTaskRequest,
  'date' | 'staff' | 'staffConfirmation' | 'taskCategory' | 'taskName' | 'department'
> & {
  date: Dayjs;
  staffUserId?: string;
  taskScoreName: string;
  taskType?: string;
  department?: string;
};

const DEFAULT_VALUES: CreateTaskFormValues = {
  projectName: '',
  projectManager: { code: '', name: '' },
  department: undefined,
  taskScoreName: '',
  taskType: '',
  level: 1,
  quantity: 1,
  date: defaultTaskDeadline(),
  urgency: 'auto',
  description: '',
  designThinking: 1,
  technical: 1,
  contentProcessing: 1,
  additionalFactors: '',
  staffUserId: undefined,
  staffNote: '',
};

const EMPTY_SCORE_FILTERS = {};

const codeFromDisplayName = (name: string): string => {
  const slug = name.trim().toUpperCase().replace(/\s+/g, '.');
  return slug || 'PM';
};

const normalizeDepartment = (value: string | undefined): TaskDepartment | undefined => {
  if (!value) return undefined;
  if (value === 'project') return 'project';
  if (value === 'creative' || value.startsWith('creative_')) return 'creative';
  return undefined;
};

export function CreateTaskModal({ open, onClose, taskCategory, preset }: CreateTaskModalProps) {
  const [form] = Form.useForm<CreateTaskFormValues>();
  const { mutate, isPending } = useCreateMyTask();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: projectOptions = [] } = useCreateTaskProjectOptions(taskCategory, open);
  const { data: pmOptions = [] } = useCreateTaskPmOptions(open);
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { groupByCode } = useTaskScoreGroupOptions({ enabled: open });
  const { options: departmentOptions, isLoading: departmentLoading } = useDepartmentOptions({
    enabled: open,
  });
  const { data: scoreList, isLoading: scoresLoading } = useTaskScoreList(EMPTY_SCORE_FILTERS, {
    enabled: open,
  });
  const isProjectTask = taskCategory === 'project';
  const projectName = Form.useWatch('projectName', form);
  const taskScoreName = Form.useWatch('taskScoreName', form);
  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const formDepartment = Form.useWatch('department', form);
  const staffSelectOptions = useMemo(() => mergeStaffSelectOptions(staffOptions), [staffOptions]);

  const scoreItems = scoreList?.items ?? [];

  const selectedScore = useMemo(() => {
    const normalized = taskScoreName?.trim().toLowerCase();
    if (!normalized) return undefined;
    return scoreItems.find((score) => score.name.trim().toLowerCase() === normalized);
  }, [scoreItems, taskScoreName]);

  const derivedTaskType = useMemo(() => {
    if (!selectedScore) return '';
    return resolveTaskType(selectedScore.taskType, selectedScore.name);
  }, [selectedScore]);

  const taskScoreOptions = useMemo(() => {
    const filtered = !formDepartment
      ? scoreItems
      : scoreItems.filter((score) => {
          const department = groupByCode[score.group]?.department;
          return department === formDepartment;
        });

    return filtered.map((score) => ({
      value: score.name,
      label: score.name,
    }));
  }, [scoreItems, formDepartment, groupByCode]);

  const defaultProjectManager = useMemo((): TaskPerson | undefined => {
    if (!currentUser?.id || !currentUser.role) return undefined;
    if (!PM_NAME_AUTO_SELECT_ROLES.includes(currentUser.role as Role)) return undefined;

    const match = pmOptions.find(
      (entry) =>
        entry.userId === currentUser.id ||
        entry.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase(),
    );
    if (match) {
      return {
        code: match.code,
        name: match.name,
        userId: match.userId ?? currentUser.id,
      };
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

  const normalizedTaskDepartment = normalizeDepartment(formDepartment);
  const isCreativeTask = normalizedTaskDepartment === 'creative';
  const areScoringFieldsDisabled = isCreativeTask;
  const filteredStaffSelectOptions = useMemo(() => {
    if (!normalizedTaskDepartment) return staffSelectOptions;
    const staffByOptionValue = new Map(
      staffOptions.map((staff) => [staff.userId ?? staff.code, staff] as const),
    );
    return staffSelectOptions.filter((option) => {
      const matchedStaff = staffByOptionValue.get(option.value);
      if (!matchedStaff) return false;
      return normalizeDepartment(matchedStaff.department ?? undefined) === normalizedTaskDepartment;
    });
  }, [normalizedTaskDepartment, staffOptions, staffSelectOptions]);
  const computedLevel = useMemo(() => {
    if (designThinking == null || technical == null || contentProcessing == null) return undefined;
    return computeTaskLevel(designThinking, technical, contentProcessing);
  }, [designThinking, technical, contentProcessing]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...DEFAULT_VALUES,
        date: defaultTaskDeadline(),
        projectName: preset?.projectName ?? DEFAULT_VALUES.projectName,
        projectManager:
          preset?.projectManager ?? defaultProjectManager ?? DEFAULT_VALUES.projectManager,
      });
    }
  }, [open, form, preset?.projectName, preset?.projectManager, defaultProjectManager]);

  useEffect(() => {
    if (!open || !isProjectTask) return;
    form.setFieldValue('staffUserId', undefined);
  }, [open, isProjectTask, projectName, form]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue('taskType', derivedTaskType);
  }, [open, derivedTaskType, form]);

  useEffect(() => {
    if (!open || computedLevel == null) return;
    form.setFieldValue('level', computedLevel);
  }, [open, computedLevel, form]);

  const handleTaskScoreChange = (name: string | null) => {
    if (!name) {
      form.setFieldsValue({ taskType: '' });
      return;
    }

    const score = scoreItems.find(
      (entry) => entry.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );
    if (!score) {
      form.setFieldsValue({ taskType: '' });
      return;
    }

    const department = groupByCode[score.group]?.department ?? undefined;
    form.setFieldsValue({
      taskType: resolveTaskType(score.taskType, score.name),
      ...(department ? { department } : {}),
    });
    if (department) {
      form.setFields([{ name: 'department', errors: [] }]);
    }
  };

  const handleDepartmentChange = (department: string | null) => {
    const nextDepartment = department ?? undefined;
    const currentName = form.getFieldValue('taskScoreName')?.trim();
    if (!nextDepartment || !currentName) return;

    const score = scoreItems.find(
      (entry) => entry.name.trim().toLowerCase() === currentName.toLowerCase(),
    );
    const scoreDepartmentValue = score
      ? (groupByCode[score.group]?.department ?? undefined)
      : undefined;
    if (scoreDepartmentValue && scoreDepartmentValue !== nextDepartment) {
      form.setFieldsValue({ taskScoreName: undefined, taskType: '' });
    }
  };

  useEffect(() => {
    if (!open) return;
    form.setFieldValue('staffUserId', undefined);
  }, [open, normalizedTaskDepartment, form]);

  useEffect(() => {
    if (!open || !isCreativeTask) return;
    // Creative tasks lock scoring UI — reset so a prior project-group selection
    // cannot submit stale classification / quantity values under disabled fields.
    form.setFieldsValue({
      designThinking: DEFAULT_VALUES.designThinking,
      technical: DEFAULT_VALUES.technical,
      contentProcessing: DEFAULT_VALUES.contentProcessing,
      additionalFactors: DEFAULT_VALUES.additionalFactors,
      level: DEFAULT_VALUES.level,
      quantity: DEFAULT_VALUES.quantity,
      description: DEFAULT_VALUES.description,
    });
  }, [open, isCreativeTask, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
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

  const handleFinish = (values: CreateTaskFormValues) => {
    const scoreName = values.taskScoreName.trim();
    const matchedScore = scoreItems.find(
      (score) => score.name.trim().toLowerCase() === scoreName.toLowerCase(),
    );
    if (!matchedScore) {
      form.setFields([{ name: 'taskScoreName', errors: ['Select a task name from the list'] }]);
      return;
    }

    const taskName = resolveTaskType(matchedScore.taskType, matchedScore.name);
    const department = values.department ?? groupByCode[matchedScore.group]?.department;

    const payload: CreateMyTaskRequest = {
      taskCategory,
      projectName: values.projectName,
      projectManager: values.projectManager,
      taskName,
      level: isCreativeTask ? DEFAULT_VALUES.level : values.level,
      quantity: isCreativeTask ? DEFAULT_VALUES.quantity : values.quantity,
      date: toTaskDeadline(values.date),
      description: isCreativeTask ? '' : (values.description ?? ''),
      designThinking: isCreativeTask ? DEFAULT_VALUES.designThinking : values.designThinking,
      technical: isCreativeTask ? DEFAULT_VALUES.technical : values.technical,
      contentProcessing: isCreativeTask
        ? DEFAULT_VALUES.contentProcessing
        : values.contentProcessing,
      additionalFactors: isCreativeTask ? '' : (values.additionalFactors ?? ''),
      staff: resolveStaffFromUserId(values.staffUserId, staffOptions),
      staffConfirmation: 'not_updated',
      staffNote: values.staffNote ?? '',
      urgency: values.urgency,
    };

    if (isProjectTask && department) {
      payload.department = department;
    }

    mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Create task"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Create task"
      confirmLoading={isPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Project</p>
          <Form.Item
            name="projectName"
            label={MY_TASK_COLUMN_HEADERS.projectName}
            rules={[{ required: true, message: 'Project name is required' }]}
          >
            <AutoComplete
              options={projectOptions.map((name) => ({ value: name }))}
              placeholder="Select or enter project name"
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
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>1) Task + Department</p>
          <div className={isProjectTask ? styles.rowThree : styles.row}>
            <Form.Item
              name="taskScoreName"
              label="Task name"
              rules={[{ required: true, message: 'Task name is required' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Select task name"
                options={taskScoreOptions}
                loading={scoresLoading}
                optionFilterProp="label"
                onChange={handleTaskScoreChange}
              />
            </Form.Item>
            <Form.Item name="taskType" label="Task type">
              <Input disabled placeholder="Auto from task name" />
            </Form.Item>
            {isProjectTask ? (
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true, message: 'Chọn phòng ban' }]}
              >
                <Select
                  allowClear
                  placeholder="Select department"
                  options={departmentOptions}
                  loading={departmentLoading}
                  onChange={handleDepartmentChange}
                />
              </Form.Item>
            ) : null}
          </div>

          <p className={styles.sectionTitle}>2) Classification</p>
          <div className={styles.rowThree}>
            <Form.Item
              name="designThinking"
              label={MY_TASK_COLUMN_HEADERS.designThinking}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select
                options={[...CLASSIFICATION_LEVEL_OPTIONS]}
                disabled={areScoringFieldsDisabled}
              />
            </Form.Item>
            <Form.Item
              name="technical"
              label={MY_TASK_COLUMN_HEADERS.technical}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select
                options={[...CLASSIFICATION_LEVEL_OPTIONS]}
                disabled={areScoringFieldsDisabled}
              />
            </Form.Item>
            <Form.Item
              name="contentProcessing"
              label={MY_TASK_COLUMN_HEADERS.contentProcessing}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select
                options={[...CLASSIFICATION_LEVEL_OPTIONS]}
                disabled={areScoringFieldsDisabled}
              />
            </Form.Item>
          </div>
          <Form.Item name="additionalFactors" label={MY_TASK_COLUMN_HEADERS.additionalFactors}>
            <Input placeholder="Optional factors" disabled={areScoringFieldsDisabled} />
          </Form.Item>

          <div className={styles.row}>
            <Form.Item
              name="level"
              label="3) Task level (auto from classification)"
              rules={[{ required: true, message: 'Level is required' }]}
            >
              <InputNumber
                min={1}
                max={4}
                precision={0}
                style={{ width: '100%' }}
                disabled={areScoringFieldsDisabled}
              />
            </Form.Item>
          </div>

          <div className={styles.row}>
            <Form.Item
              name="quantity"
              label="4) Quantity"
              rules={[{ required: true, message: 'Quantity is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} disabled={areScoringFieldsDisabled} />
            </Form.Item>
          </div>

          <Form.Item name="description" label="5) Brief description">
            <Input.TextArea
              rows={3}
              placeholder="Add context or requirements"
              disabled={areScoringFieldsDisabled}
            />
          </Form.Item>

          <div className={styles.row}>
            <Form.Item
              name="date"
              label="6) Deadline"
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
            <Form.Item
              name="urgency"
              label={MY_TASK_COLUMN_HEADERS.urgency}
              rules={[{ required: true, message: 'Urgency is required' }]}
            >
              <TaskUrgencySelect />
            </Form.Item>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>7) Assign nhân viên</p>
          <Form.Item
            name="staffUserId"
            label={MY_TASK_COLUMN_HEADERS.staffName}
            rules={
              normalizedTaskDepartment
                ? [{ required: true, message: 'Select a staff member in the same department' }]
                : isProjectTask
                  ? [{ required: true, message: 'Select a staff member for this project task' }]
                  : []
            }
          >
            <Select
              allowClear={!isProjectTask}
              showSearch
              optionFilterProp="label"
              placeholder={
                normalizedTaskDepartment === 'creative'
                  ? 'Select creative staff'
                  : normalizedTaskDepartment === 'project'
                    ? 'Select project staff'
                    : isProjectTask
                      ? 'Select staff for this task'
                      : UNASSIGNED_STAFF_LABEL
              }
              options={filteredStaffSelectOptions}
            />
          </Form.Item>
          <Form.Item name="staffNote" label={MY_TASK_COLUMN_HEADERS.staffNote}>
            <Input.TextArea rows={2} placeholder="Optional note for assignee" />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
