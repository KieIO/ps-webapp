import { Alert, DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES } from '@/config/permissions';
import {
  EVALUATION_LEVEL_LABELS,
  EVALUATION_LEVEL_OPTIONS,
  STATUS_OPTIONS,
} from '@/features/projects/constants';
import { useProject } from '@/features/projects/hooks/useProjectList';
import { useUpdateProject } from '@/features/projects/hooks/useUpdateProject';
import { buildUpdateProjectPayload } from '@/features/projects/utils/buildUpdateProjectPayload';
import { computeProjectLevel } from '@/features/projects/utils/projectLevel';
import type {
  EvaluationLevel,
  ProjectStatus,
  ProjectUrgency,
} from '@/features/projects/schemas/project.schema';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  MY_TASK_HEAD_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
  TASK_STATUS_CHANGE_NOTE_LABEL,
} from '../../constants';
import { useUpdateHeadMyTask } from '../../hooks/useUpdateHeadMyTask';
import { useUpdateMyTask } from '../../hooks/useUpdateMyTask';
import type {
  MyTask,
  TaskConfirmationStatus,
  UpdateHeadMyTaskRequest,
} from '../../schemas/task.schema';
import { resolveProjectContextFromTask } from '../../utils/taskProjectContext';
import {
  canCancelTask,
  canChangeTaskStatus,
  confirmCancelTask,
  getTaskStatusOptionsForRole,
  isTransitioningToCancelled,
  TASK_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
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
  /** Task lifecycle status (staffConfirmation) — not project status. */
  staffConfirmation: TaskConfirmationStatus;
  staffNote: string;
  projectStatus: ProjectStatus;
  projectFinishedDate?: Dayjs;
  /** Task urgency only — project urgency is edited in Create/Edit project modals. */
  urgency: ProjectUrgency;
};

export function EditHeadTaskModal({ open, task, onClose }: EditHeadTaskModalProps) {
  const [form] = Form.useForm<HeadTaskFormValues>();
  const { role } = usePermission();
  const { mutateAsync: updateProjectAsync, isPending: isProjectPending } = useUpdateProject();
  const { mutateAsync: updateHeadTaskAsync, isPending: isTaskPending } = useUpdateHeadMyTask();
  const { mutateAsync: updateTaskAsync, isPending: isTaskUrgencyPending } = useUpdateMyTask();
  const { data: linkedProject } = useProject(task?.projectId ?? '');

  const saveViaProject =
    task?.taskCategory === 'project' && task.projectId != null && linkedProject != null;

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const projectTime = Form.useWatch('projectTime', form);
  const projectStatus = Form.useWatch('projectStatus', form);
  const statusEditable = task ? canChangeTaskStatus(task, role) : true;
  const statusOptions = getTaskStatusOptionsForRole(role, task?.staffConfirmation);

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
      staffConfirmation: task.staffConfirmation,
      staffNote: task.staffNote,
      projectStatus: (ctx.projectStatus ?? 'not_updated') as ProjectStatus,
      projectFinishedDate: ctx.projectFinishedDate ? dayjs(ctx.projectFinishedDate) : undefined,
      urgency: task.urgency,
    });
  }, [task, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async (values: HeadTaskFormValues) => {
    if (!task) return;

    if (!canChangeTaskStatus(task, role) && values.staffConfirmation !== task.staffConfirmation) {
      return;
    }

    if (isTransitioningToCancelled(task.staffConfirmation, values.staffConfirmation)) {
      if (!canCancelTask(role)) return;
      const confirmed = await confirmCancelTask();
      if (!confirmed) return;
    }

    const closeModal = () => {
      form.resetFields();
      onClose();
    };

    const taskPayloadChanged =
      values.urgency !== task.urgency ||
      values.staffConfirmation !== task.staffConfirmation ||
      (values.staffNote ?? '') !== task.staffNote;

    try {
      if (saveViaProject && linkedProject) {
        const jobs: Promise<unknown>[] = [
          updateProjectAsync({
            id: linkedProject.id,
            payload: buildUpdateProjectPayload(linkedProject, {
              startDate: values.startDate.toISOString(),
              endDate: values.endDate.toISOString(),
              brief: values.brief ?? '',
              volume: values.volume,
              nature: values.nature,
              time: values.projectTime,
              additionalFactors: values.additionalFactors ?? '',
              evaluation: values.pmEvaluation ?? '',
              note: values.pmNote ?? '',
              status: values.projectStatus,
              // Keep existing project urgency — only force gray when project is closed.
              urgency:
                values.projectStatus === 'finish' || values.projectStatus === 'cancel'
                  ? 'gray'
                  : linkedProject.urgency,
            }),
          }),
        ];

        if (taskPayloadChanged) {
          jobs.push(
            updateTaskAsync({
              id: task.id,
              payload: {
                taskName: task.taskName,
                quantity: task.quantity,
                date: task.date,
                description: task.description,
                designThinking: task.designThinking,
                technical: task.technical,
                contentProcessing: task.contentProcessing,
                additionalFactors: task.additionalFactors,
                staff: task.staff,
                staffConfirmation: values.staffConfirmation,
                staffNote: values.staffNote ?? '',
                urgency: values.urgency,
              },
              successMessage: null,
            }),
          );
        }

        await Promise.all(jobs);
        closeModal();
        return;
      }

      // Non-linked: head-context request includes task urgency; status via task update.
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
        urgency: values.urgency,
      };

      const jobs: Promise<unknown>[] = [updateHeadTaskAsync({ id: task.id, payload })];

      if (
        values.staffConfirmation !== task.staffConfirmation ||
        (values.staffNote ?? '') !== task.staffNote
      ) {
        jobs.push(
          updateTaskAsync({
            id: task.id,
            payload: {
              taskName: task.taskName,
              quantity: task.quantity,
              date: task.date,
              description: task.description,
              designThinking: task.designThinking,
              technical: task.technical,
              contentProcessing: task.contentProcessing,
              additionalFactors: values.additionalFactors ?? task.additionalFactors,
              staff: task.staff,
              staffConfirmation: values.staffConfirmation,
              staffNote: values.staffNote ?? '',
              urgency: values.urgency,
            },
            successMessage: null,
          }),
        );
      }

      await Promise.all(jobs);
      closeModal();
    } catch {
      // Mutation hooks already surface errors via toast.
    }
  };

  const headers = MY_TASK_HEAD_COLUMN_HEADERS;

  return (
    <Modal
      title={task ? `Edit task — ${task.taskCode}` : 'Edit task'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save changes"
      confirmLoading={isProjectPending || isTaskPending || isTaskUrgencyPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {task && (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{headers.projectName}</span>
            <span className={styles.contextValue} title={task.projectName}>
              {task.projectName}
            </span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{headers.projectManager}</span>
            <span className={styles.contextValue} title={task.projectManager.name}>
              {task.projectManager.name}
            </span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{headers.projectLevel}</span>
            <span className={styles.contextValue}>
              {previewLevel ? EVALUATION_LEVEL_LABELS[previewLevel] : '—'}
            </span>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={!task}
      >
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Schedule</p>
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

          <Form.Item
            name="urgency"
            label="Urgency"
            rules={[{ required: true, message: 'Urgency is required' }]}
          >
            <TaskUrgencySelect />
          </Form.Item>

          <Form.Item name="brief" label={headers.brief}>
            <Input.TextArea rows={2} placeholder="Project brief" />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Classification</p>
          <div className={styles.rowThree}>
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
            <Form.Item
              name="projectTime"
              label={headers.projectTime}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
            </Form.Item>
          </div>
          <Form.Item name="additionalFactors" label={headers.additionalFactors}>
            <Input placeholder="Optional factors" />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Quality & status</p>
          {!statusEditable ? (
            <Alert
              type="info"
              showIcon
              message={TASK_STATUS_LOCKED_MESSAGE}
              style={{ marginBottom: 12 }}
            />
          ) : null}
          <div className={styles.row}>
            <Form.Item name="pmEvaluation" label={headers.evaluation}>
              <Select
                allowClear
                placeholder="Select score"
                options={[...PROJECT_EVALUATION_SCORE_OPTIONS]}
              />
            </Form.Item>
            <Form.Item
              name="staffConfirmation"
              label={headers.confirmation}
              rules={[{ required: true, message: 'Task status is required' }]}
            >
              <Select
                options={statusOptions}
                disabled={!statusEditable}
                placeholder="Select status"
              />
            </Form.Item>
          </div>

          {statusEditable || role === ROLES.ADMIN ? (
            <Form.Item name="staffNote" label={TASK_STATUS_CHANGE_NOTE_LABEL}>
              <Input.TextArea
                rows={2}
                placeholder="Note for status change"
                disabled={!statusEditable}
              />
            </Form.Item>
          ) : null}

          <Form.Item
            name="projectStatus"
            label={headers.projectStatus}
            rules={[{ required: true, message: 'Project status is required' }]}
          >
            <Select options={[...STATUS_OPTIONS]} />
          </Form.Item>

          {projectStatus === 'finish' ? (
            <Form.Item name="projectFinishedDate" label={headers.finishedDate}>
              <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
            </Form.Item>
          ) : null}

          <Form.Item name="pmNote" label={headers.pmNote}>
            <Input.TextArea rows={3} placeholder="Add a note" />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
