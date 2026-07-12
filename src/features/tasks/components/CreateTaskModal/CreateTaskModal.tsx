import { AutoComplete, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { DEPARTMENT_OPTIONS } from '@/features/projects/constants';
import { useTaskScoreGroupOptions } from '@/features/task-scores/hooks/useTaskScoreGroupOptions';
import { useTaskScoreList } from '@/features/task-scores/hooks/useTaskScoreList';
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
import { mergeStaffSelectOptions, resolveStaffFromUserIds } from '../../utils/staff';
import { parseTaskScoreName, toClassificationLevel } from '../../utils/taskScoreName';
import { toTaskDateOnly } from '../../utils/taskDates';
import type {
  CreateMyTaskRequest,
  TaskCategory,
  TaskDepartment,
  TaskPerson,
} from '../../schemas/task.schema';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

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
  staffUserIds: string[];
  taskGroup: string;
  taskScoreName: string;
  department?: TaskDepartment;
};

const DEFAULT_VALUES: CreateTaskFormValues = {
  projectName: '',
  projectManager: { code: '', name: '' },
  department: undefined,
  taskGroup: '',
  taskScoreName: '',
  level: 2,
  quantity: 1,
  date: dayjs(),
  description: '',
  designThinking: 2,
  technical: 2,
  contentProcessing: 2,
  additionalFactors: '',
  staffUserIds: [],
  staffNote: '',
};

export function CreateTaskModal({ open, onClose, taskCategory, preset }: CreateTaskModalProps) {
  const [form] = Form.useForm<CreateTaskFormValues>();
  const { mutate, isPending } = useCreateMyTask();
  const { data: projectOptions = [] } = useCreateTaskProjectOptions(taskCategory);
  const { data: pmOptions = [] } = useCreateTaskPmOptions();
  const { data: staffOptions = [] } = useCreateTaskStaffOptions();
  const {
    options: taskGroupOptions,
    groupByCode,
    isLoading: taskGroupLoading,
  } = useTaskScoreGroupOptions();
  const isProjectTask = taskCategory === 'project';
  const projectName = Form.useWatch('projectName', form);
  const taskGroup = Form.useWatch('taskGroup', form);
  const scoreFilters = useMemo(() => ({ group: taskGroup }), [taskGroup]);
  const {
    data: scoreList,
    isLoading: scoresLoading,
    isFetching: scoresFetching,
  } = useTaskScoreList(scoreFilters, { enabled: Boolean(taskGroup) });
  const staffSelectOptions = useMemo(() => mergeStaffSelectOptions(staffOptions), [staffOptions]);
  const taskScoreOptions = useMemo(
    () =>
      (scoreList?.items ?? []).map((score) => ({
        value: score.name,
        label: score.name,
      })),
    [scoreList?.items],
  );

  const derivedDepartment = useMemo(() => {
    if (!taskGroup) return undefined;
    return (groupByCode[taskGroup]?.department ?? undefined) as TaskDepartment | undefined;
  }, [taskGroup, groupByCode]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...DEFAULT_VALUES,
        projectName: preset?.projectName ?? DEFAULT_VALUES.projectName,
        projectManager: preset?.projectManager ?? DEFAULT_VALUES.projectManager,
      });
    }
  }, [open, form, preset?.projectName, preset?.projectManager]);

  useEffect(() => {
    if (!open || !isProjectTask) return;
    form.setFieldValue('staffUserIds', []);
  }, [open, isProjectTask, projectName, form]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue('department', derivedDepartment);
    if (derivedDepartment) {
      form.setFields([{ name: 'department', errors: [] }]);
    }
  }, [open, derivedDepartment, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handlePmSelect = (pmCode: string | undefined) => {
    if (!pmCode) {
      form.setFieldValue('projectManager', { code: '', name: '' });
      return;
    }
    const pm = pmOptions.find((entry) => entry.code === pmCode);
    if (pm) {
      form.setFieldValue('projectManager', { code: pm.code, name: pm.name });
    }
  };

  const handleGroupChange = () => {
    form.setFieldValue('taskScoreName', undefined);
  };

  const handleTaskScoreChange = (scoreName: string | undefined) => {
    if (!scoreName) return;
    const level = toClassificationLevel(parseTaskScoreName(scoreName).level);
    if (level != null) {
      form.setFieldValue('level', level);
    }
  };

  const handleFinish = (values: CreateTaskFormValues) => {
    const { baseName } = parseTaskScoreName(values.taskScoreName);
    const department = derivedDepartment ?? values.department;

    const payload: CreateMyTaskRequest = {
      taskCategory,
      projectName: values.projectName,
      projectManager: values.projectManager,
      taskName: baseName,
      level: values.level,
      quantity: values.quantity,
      date: toTaskDateOnly(values.date),
      description: values.description ?? '',
      designThinking: values.designThinking,
      technical: values.technical,
      contentProcessing: values.contentProcessing,
      additionalFactors: values.additionalFactors ?? '',
      staff: resolveStaffFromUserIds(values.staffUserIds, staffOptions),
      staffConfirmation: 'not_updated',
      staffNote: values.staffNote ?? '',
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
              options={pmOptions.map((pm) => ({
                value: pm.code,
                label: `${pm.code} — ${pm.name}`,
              }))}
            />
          </Form.Item>
          <Form.Item name={['projectManager', 'name']} hidden>
            <Input />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Task</p>
          <div className={isProjectTask ? styles.rowThree : styles.row}>
            <Form.Item
              name="taskGroup"
              label="Group"
              rules={[{ required: true, message: 'Group is required' }]}
            >
              <Select
                showSearch
                loading={taskGroupLoading}
                placeholder="Select group"
                options={taskGroupOptions}
                onChange={handleGroupChange}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item
              name="taskScoreName"
              label={MY_TASK_COLUMN_HEADERS.taskName}
              rules={[{ required: true, message: 'Task name is required' }]}
            >
              <Select
                showSearch
                loading={Boolean(taskGroup) && (scoresLoading || scoresFetching)}
                disabled={!taskGroup}
                placeholder={taskGroup ? 'Select task score' : 'Select a group first'}
                options={taskScoreOptions}
                onChange={handleTaskScoreChange}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
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
                    message: taskGroup ? 'Group này chưa có phòng ban' : 'Chọn group trước',
                  },
                ]}
              >
                <Select disabled placeholder="—" options={[...DEPARTMENT_OPTIONS]} open={false} />
              </Form.Item>
            ) : null}
          </div>

          <div className={styles.rowThree}>
            <Form.Item
              name="level"
              label={MY_TASK_COLUMN_HEADERS.level}
              rules={[{ required: true, message: 'Level is required' }]}
            >
              <InputNumber min={1} max={4} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="quantity"
              label={MY_TASK_COLUMN_HEADERS.quantity}
              rules={[{ required: true, message: 'Quantity is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="date"
              label={MY_TASK_COLUMN_HEADERS.date}
              rules={[{ required: true, message: 'Date is required' }]}
            >
              <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="description" label={MY_TASK_COLUMN_HEADERS.description}>
            <Input.TextArea rows={3} placeholder="Add context or requirements" />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Classification</p>
          <div className={styles.rowThree}>
            <Form.Item
              name="designThinking"
              label={MY_TASK_COLUMN_HEADERS.designThinking}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
            </Form.Item>
            <Form.Item
              name="technical"
              label={MY_TASK_COLUMN_HEADERS.technical}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
            </Form.Item>
            <Form.Item
              name="contentProcessing"
              label={MY_TASK_COLUMN_HEADERS.contentProcessing}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
            </Form.Item>
          </div>
          <Form.Item name="additionalFactors" label={MY_TASK_COLUMN_HEADERS.additionalFactors}>
            <Input placeholder="Optional factors" />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Assignment</p>
          <Form.Item
            name="staffUserIds"
            label={MY_TASK_COLUMN_HEADERS.staffName}
            rules={
              isProjectTask
                ? [
                    {
                      required: true,
                      type: 'array',
                      min: 1,
                      message: 'Select at least one staff member for this project task',
                    },
                  ]
                : []
            }
          >
            <Select
              mode="multiple"
              allowClear={!isProjectTask}
              placeholder={isProjectTask ? 'Select staff for this task' : UNASSIGNED_STAFF_LABEL}
              options={staffSelectOptions}
            />
          </Form.Item>
          <Form.Item name="staffNote" label={MY_TASK_COLUMN_HEADERS.staffNote}>
            <Input.TextArea rows={2} placeholder="Optional note for assignees" />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
