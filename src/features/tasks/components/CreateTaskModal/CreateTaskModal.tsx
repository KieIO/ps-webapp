import { AutoComplete, DatePicker, Form, Input, InputNumber, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { useDepartmentOptions } from '@/features/departments/hooks/useDepartmentOptions';
import { taskScoreApi } from '@/features/task-scores/api';
import { useTaskScoreGroupOptions } from '@/features/task-scores/hooks/useTaskScoreGroupOptions';
import { useTaskScoreList } from '@/features/task-scores/hooks/useTaskScoreList';
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
import { parseTaskScoreName } from '../../utils/taskScoreName';
import { toTaskDateOnly } from '../../utils/taskDates';
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
  taskGroup: string;
  taskScoreName: string;
  department?: string;
};

const DEFAULT_VALUES: CreateTaskFormValues = {
  projectName: '',
  projectManager: { code: '', name: '' },
  department: undefined,
  taskGroup: '',
  taskScoreName: '',
  level: 1,
  quantity: 1,
  date: dayjs(),
  urgency: 'auto',
  description: '',
  designThinking: 1,
  technical: 1,
  contentProcessing: 1,
  additionalFactors: '',
  staffUserId: undefined,
  staffNote: '',
};

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
  const [isPreparingCatalog, setIsPreparingCatalog] = useState(false);
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateMyTask();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: projectOptions = [] } = useCreateTaskProjectOptions(taskCategory, open);
  const { data: pmOptions = [] } = useCreateTaskPmOptions(open);
  const { data: staffOptions = [] } = useCreateTaskStaffOptions(open);
  const { options: taskGroupOptions, groupByCode } = useTaskScoreGroupOptions({ enabled: open });
  const { options: departmentOptions, isLoading: departmentLoading } = useDepartmentOptions({
    enabled: open,
  });
  const isProjectTask = taskCategory === 'project';
  const projectName = Form.useWatch('projectName', form);
  const taskGroup = Form.useWatch('taskGroup', form);
  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);
  const formDepartment = Form.useWatch('department', form);
  const matchedTaskGroup = useMemo(
    () =>
      taskGroupOptions.find((option) => {
        const normalizedGroup = taskGroup?.trim().toLowerCase();
        if (!normalizedGroup) return false;
        return (
          option.value.toLowerCase() === normalizedGroup ||
          option.label.toLowerCase() === normalizedGroup
        );
      }),
    [taskGroup, taskGroupOptions],
  );
  const selectedGroupCode = matchedTaskGroup?.value;
  const scoreFilters = useMemo(
    () => ({ group: selectedGroupCode ?? taskGroup }),
    [selectedGroupCode, taskGroup],
  );
  const { data: scoreList } = useTaskScoreList(scoreFilters, {
    enabled: open && Boolean(taskGroup),
  });
  const staffSelectOptions = useMemo(() => mergeStaffSelectOptions(staffOptions), [staffOptions]);
  const taskGroupAutoCompleteOptions = useMemo(
    () =>
      taskGroupOptions.map((option) => ({
        value: option.label,
        label: option.label,
      })),
    [taskGroupOptions],
  );
  const taskScoreOptions = useMemo(
    () =>
      (scoreList?.items ?? []).map((score) => ({
        value: score.name,
        label: score.name,
      })),
    [scoreList?.items],
  );

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

  const derivedDepartment = useMemo(() => {
    if (!selectedGroupCode) return undefined;
    return groupByCode[selectedGroupCode]?.department ?? undefined;
  }, [selectedGroupCode, groupByCode]);
  const effectiveDepartment = derivedDepartment ?? formDepartment;
  const normalizedTaskDepartment = normalizeDepartment(effectiveDepartment);
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
    form.setFieldValue('department', derivedDepartment);
    if (derivedDepartment) {
      form.setFields([{ name: 'department', errors: [] }]);
    }
  }, [open, derivedDepartment, form]);

  useEffect(() => {
    if (!open || computedLevel == null) return;
    form.setFieldValue('level', computedLevel);
  }, [open, computedLevel, form]);

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

  const handleGroupChange = () => {
    form.setFieldValue('taskScoreName', undefined);
  };

  const handleFinish = async (values: CreateTaskFormValues) => {
    const taskGroupInput = values.taskGroup.trim();
    const taskScoreInput = values.taskScoreName.trim();
    const { baseName } = parseTaskScoreName(taskScoreInput);

    const matchedGroup =
      taskGroupOptions.find(
        (option) =>
          option.value.toLowerCase() === taskGroupInput.toLowerCase() ||
          option.label.toLowerCase() === taskGroupInput.toLowerCase(),
      ) ?? null;
    const matchedGroupCode = matchedGroup?.value;
    const knownGroupDepartment = matchedGroupCode
      ? (groupByCode[matchedGroupCode]?.department ?? undefined)
      : undefined;
    const department = knownGroupDepartment ?? values.department;

    let groupCode = matchedGroupCode ?? '';
    setIsPreparingCatalog(true);
    try {
      if (!matchedGroupCode) {
        const createdGroup = await taskScoreApi.createGroup({
          label: taskGroupInput,
          department: department ?? null,
        });
        groupCode = createdGroup.code;
        await queryClient.invalidateQueries({ queryKey: ['task-score-groups'] });
      }

      const hasExistingScore = (scoreList?.items ?? []).some(
        (score) => score.name.trim().toLowerCase() === taskScoreInput.toLowerCase(),
      );
      if (!hasExistingScore) {
        await taskScoreApi.create({
          name: taskScoreInput,
          group: groupCode,
          score: 0,
        });
        await queryClient.invalidateQueries({ queryKey: ['task-scores'] });
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to prepare group/task score');
      setIsPreparingCatalog(false);
      return;
    }
    setIsPreparingCatalog(false);

    const payload: CreateMyTaskRequest = {
      taskCategory,
      projectName: values.projectName,
      projectManager: values.projectManager,
      taskName: baseName,
      level: isCreativeTask ? DEFAULT_VALUES.level : values.level,
      quantity: isCreativeTask ? DEFAULT_VALUES.quantity : values.quantity,
      date: toTaskDateOnly(values.date),
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
      confirmLoading={isPending || isPreparingCatalog}
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
              name="taskGroup"
              label="Group"
              rules={[{ required: true, message: 'Group is required' }]}
            >
              <AutoComplete
                placeholder="Select or enter group"
                options={taskGroupAutoCompleteOptions}
                onChange={handleGroupChange}
                filterOption={(input, option) =>
                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="taskScoreName"
              label="Task"
              rules={[{ required: true, message: 'Task name is required' }]}
            >
              <AutoComplete
                placeholder={taskGroup ? 'Select or enter task score' : 'Select a group first'}
                options={taskScoreOptions}
                filterOption={(input, option) =>
                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            {isProjectTask ? (
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[
                  {
                    required: true,
                    message: !taskGroup
                      ? 'Chọn group trước'
                      : derivedDepartment
                        ? 'Group này chưa có phòng ban'
                        : 'Chọn phòng ban cho group mới',
                  },
                ]}
              >
                <Select
                  disabled={Boolean(derivedDepartment)}
                  placeholder={derivedDepartment ? 'Auto from group' : 'Select department'}
                  options={departmentOptions}
                  loading={departmentLoading}
                  open={derivedDepartment ? false : undefined}
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
              label="6) Deadline (tính đến 23:59:59 cuối ngày)"
              rules={[{ required: true, message: 'Date is required' }]}
            >
              <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
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
