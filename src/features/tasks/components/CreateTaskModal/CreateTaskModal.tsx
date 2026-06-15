import { AutoComplete, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  CLASSIFICATION_LEVEL_OPTIONS,
  DEFAULT_TASK_NAME_OPTIONS,
  MY_TASK_COLUMN_HEADERS,
  UNASSIGNED_STAFF_LABEL,
} from '../../constants';
import {
  useCreateTaskPmOptions,
  useCreateTaskProjectOptions,
  useCreateTaskStaffOptions,
} from '../../hooks/useCreateTaskOptions';
import { useCreateMyTask } from '../../hooks/useCreateMyTask';
import {
  mergeStaffSelectOptions,
  resolveStaffFromUserIds,
} from '../../utils/staff';
import { toTaskDateOnly } from '../../utils/taskDates';
import type { CreateMyTaskRequest, TaskCategory, TaskPerson } from '../../schemas/task.schema';
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
  'date' | 'staff' | 'staffConfirmation' | 'taskCategory'
> & {
  date: Dayjs;
  staffUserIds: string[];
};

const DEFAULT_VALUES: CreateTaskFormValues = {
  projectName: '',
  projectManager: { code: '', name: '' },
  taskName: '',
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
  const isProjectTask = taskCategory === 'project';
  const projectName = Form.useWatch('projectName', form);
  const staffSelectOptions = useMemo(
    () => mergeStaffSelectOptions(staffOptions),
    [staffOptions],
  );

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

  const handleFinish = (values: CreateTaskFormValues) => {
    const payload: CreateMyTaskRequest = {
      taskCategory,
      projectName: values.projectName,
      projectManager: values.projectManager,
      taskName: values.taskName,
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

        <p className={styles.sectionTitle}>Task details</p>
        <div className={styles.row}>
          <Form.Item
            name="taskName"
            label={MY_TASK_COLUMN_HEADERS.taskName}
            rules={[{ required: true, message: 'Task name is required' }]}
          >
            <Select
              showSearch
              placeholder="Select task name"
              options={DEFAULT_TASK_NAME_OPTIONS.map((name) => ({ value: name, label: name }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item
            name="level"
            label={MY_TASK_COLUMN_HEADERS.level}
            rules={[{ required: true, message: 'Level is required' }]}
          >
            <InputNumber min={1} max={4} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <div className={styles.row}>
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
          <Input.TextArea rows={3} />
        </Form.Item>

        <p className={styles.sectionTitle}>Task classification</p>
        <div className={styles.row}>
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
        </div>
        <div className={styles.row}>
          <Form.Item
            name="contentProcessing"
            label={MY_TASK_COLUMN_HEADERS.contentProcessing}
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="additionalFactors"
            label={MY_TASK_COLUMN_HEADERS.additionalFactors}
          >
            <Input />
          </Form.Item>
        </div>

        <p className={styles.sectionTitle}>Staff</p>
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
            placeholder={
              isProjectTask
                ? 'Select staff for this task'
                : UNASSIGNED_STAFF_LABEL
            }
            options={staffSelectOptions}
          />
        </Form.Item>
        <Form.Item name="staffNote" label={MY_TASK_COLUMN_HEADERS.staffNote}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
