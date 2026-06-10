import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  EVALUATION_LEVEL_LABELS,
  EVALUATION_LEVEL_OPTIONS,
  STATUS_OPTIONS,
} from '@/features/projects/constants';
import { useProject } from '@/features/projects/hooks/useProjectList';
import { useUpdateProject } from '@/features/projects/hooks/useUpdateProject';
import { computeProjectLevel } from '@/features/projects/utils/projectLevel';
import type { EvaluationLevel, ProjectStatus } from '@/features/projects/schemas/project.schema';
import {
  MY_TASK_HEAD_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
} from '../../constants';
import { useUpdateHeadMyTask } from '../../hooks/useUpdateHeadMyTask';
import type { MyTask, UpdateHeadMyTaskRequest } from '../../schemas/task.schema';
import { resolveProjectContextFromTask } from '../../utils/taskProjectContext';
import styles from '../EditTaskModal/EditTaskModal.module.scss';

interface EditHeadTaskModalProps {
  open: boolean;
  task: MyTask | null;
  onClose: () => void;
}

type HeadTaskFormValues = {
  startDate: Dayjs;
  endDate: Dayjs;
  brief: string;
  volume: EvaluationLevel;
  nature: EvaluationLevel;
  projectTime: EvaluationLevel;
  additionalFactors: string;
  pmEvaluation: string;
  pmNote: string;
  projectStatus: ProjectStatus;
  projectFinishedDate?: Dayjs;
};

export function EditHeadTaskModal({ open, task, onClose }: EditHeadTaskModalProps) {
  const [form] = Form.useForm<HeadTaskFormValues>();
  const { mutate: updateProject, isPending: isProjectPending } = useUpdateProject();
  const { mutate: updateHeadTask, isPending: isTaskPending } = useUpdateHeadMyTask();
  const { data: linkedProject } = useProject(task?.projectId ?? '');

  const saveViaProject =
    task?.taskCategory === 'project' && task.projectId != null && linkedProject != null;

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const projectTime = Form.useWatch('projectTime', form);
  const projectStatus = Form.useWatch('projectStatus', form);

  const previewLevel: EvaluationLevel | undefined =
    volume != null && nature != null && projectTime != null
      ? computeProjectLevel(volume, nature, projectTime)
      : task
        ? (resolveProjectContextFromTask(task).projectLevel as EvaluationLevel | undefined)
        : undefined;

  useEffect(() => {
    if (!task || !open) return;

    const ctx = resolveProjectContextFromTask(task);
    form.setFieldsValue({
      startDate: dayjs(ctx.projectStartDate ?? task.date),
      endDate: dayjs(ctx.projectEndDate ?? task.updatedAt ?? task.date),
      brief: ctx.projectBrief ?? '',
      volume: (ctx.projectVolume ?? 1) as EvaluationLevel,
      nature: (ctx.projectNature ?? 1) as EvaluationLevel,
      projectTime: (ctx.projectTime ?? 1) as EvaluationLevel,
      additionalFactors: ctx.additionalFactors ?? '',
      pmEvaluation: ctx.pmEvaluation ?? '',
      pmNote: ctx.pmNote ?? '',
      projectStatus: (ctx.projectStatus ?? 'not_updated') as ProjectStatus,
      projectFinishedDate: ctx.projectFinishedDate ? dayjs(ctx.projectFinishedDate) : undefined,
    });
  }, [task, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: HeadTaskFormValues) => {
    if (!task) return;

    const onSaved = () => {
      form.resetFields();
      onClose();
    };

    if (saveViaProject && linkedProject) {
      updateProject(
        {
          id: linkedProject.id,
          payload: {
            client: linkedProject.client,
            name: linkedProject.name,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
            department: linkedProject.department,
            departmentHead: linkedProject.departmentHead,
            brief: values.brief ?? '',
            volume: values.volume,
            nature: values.nature,
            time: values.projectTime,
            additionalFactors: values.additionalFactors ?? '',
            pm: linkedProject.pm,
            evaluation: values.pmEvaluation ?? '',
            note: values.pmNote ?? '',
            status: values.projectStatus,
          },
        },
        { onSuccess: onSaved },
      );
      return;
    }

    const payload: UpdateHeadMyTaskRequest = {
      projectStartDate: values.startDate.toISOString(),
      projectEndDate: values.endDate.toISOString(),
      projectBrief: values.brief ?? '',
      projectVolume: values.volume,
      projectNature: values.nature,
      projectTime: values.projectTime,
      additionalFactors: values.additionalFactors ?? '',
      pmEvaluation: values.pmEvaluation ?? '',
      pmNote: values.pmNote ?? '',
      projectStatus: values.projectStatus,
      projectFinishedDate:
        values.projectStatus === 'finish'
          ? (values.projectFinishedDate ?? dayjs()).toISOString()
          : undefined,
    };

    updateHeadTask({ id: task.id, payload }, { onSuccess: onSaved });
  };

  const headers = MY_TASK_HEAD_COLUMN_HEADERS;

  return (
    <Modal
      title={task ? `Edit task — ${task.taskCode}` : 'Edit task'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save changes"
      confirmLoading={isProjectPending || isTaskPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {task && (
        <div className={styles.readOnly}>
          <span>
            <span className={styles.readOnlyLabel}>{headers.projectName}:</span>{' '}
            {task.projectName}
          </span>
          <span>
            <span className={styles.readOnlyLabel}>{headers.projectManager}:</span>{' '}
            {task.projectManager.name}
          </span>
          <span>
            <span className={styles.readOnlyLabel}>{headers.projectLevel}:</span>{' '}
            {previewLevel ? EVALUATION_LEVEL_LABELS[previewLevel] : '—'}
          </span>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={!task}
      >
        <div className={styles.row}>
          <Form.Item
            name="startDate"
            label={headers.startDate}
            rules={[{ required: true, message: 'Start date is required' }]}
          >
            <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={headers.endDate}
            rules={[{ required: true, message: 'End date is required' }]}
          >
            <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
        </div>

        <Form.Item name="brief" label={headers.brief}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <p className={styles.sectionTitle}>Project classification</p>
        <div className={styles.row}>
          <Form.Item
            name="volume"
            label={headers.volume}
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item
            name="nature"
            label={headers.nature}
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
          </Form.Item>
        </div>
        <div className={styles.row}>
          <Form.Item
            name="projectTime"
            label={headers.projectTime}
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="additionalFactors" label={headers.additionalFactors}>
            <Input />
          </Form.Item>
        </div>

        <p className={styles.sectionTitle}>Quality & status</p>
        <div className={styles.row}>
          <Form.Item name="pmEvaluation" label={headers.evaluation}>
            <Select
              allowClear
              placeholder="Select score"
              options={[...PROJECT_EVALUATION_SCORE_OPTIONS]}
            />
          </Form.Item>
          <Form.Item
            name="projectStatus"
            label={headers.projectStatus}
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select options={[...STATUS_OPTIONS]} />
          </Form.Item>
        </div>

        {projectStatus === 'finish' ? (
          <Form.Item name="projectFinishedDate" label={headers.finishedDate}>
            <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
          </Form.Item>
        ) : null}

        <Form.Item name="pmNote" label={headers.pmNote}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
