import { DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { ROLES } from '@/config/permissions';
import { DEPARTMENT_LABELS } from '@/features/projects/constants';
import type { ProjectDepartment } from '@/features/projects/schemas/project.schema';
import {
  CLASSIFICATION_LEVEL_LABELS,
  CLASSIFICATION_LEVEL_OPTIONS,
  TASK_STATUS_OPTIONS,
  MY_TASK_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
  TASK_STATUS_CHANGE_NOTE_LABEL,
  UNASSIGNED_STAFF_LABEL,
} from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useUpdateMyTask } from '../../hooks/useUpdateMyTask';
import { useUpdateMyTaskPmEvaluation } from '../../hooks/useUpdateMyTaskPmEvaluation';
import { computeTaskLevel } from '../../utils/taskLevel';
import {
  getEditTaskFieldsForRole,
  showsEvaluationReadOnly,
  showsTaskLevelPreview,
  type EditTaskField,
} from '../../utils/editTaskFields';
import {
  mergeStaffSelectOptions,
  resolveStaffFromUserIds,
  staffOptionKey,
} from '../../utils/staff';
import { toTaskDateOnly } from '../../utils/taskDates';
import type { ClassificationLevel, MyTask, UpdateMyTaskRequest } from '../../schemas/task.schema';
import styles from './EditTaskModal.module.scss';

interface EditTaskModalProps {
  open: boolean;
  task: MyTask | null;
  role: Role;
  canEvaluate: boolean;
  onClose: () => void;
}

type EditTaskFormValues = Omit<UpdateMyTaskRequest, 'date' | 'staff'> & {
  date: Dayjs;
  staffUserIds: string[];
  completionPercent?: number;
  pmEvaluation?: string;
  pmNote?: string;
};

const hasField = (fields: Set<EditTaskField>, key: EditTaskField) => fields.has(key);

export function EditTaskModal({ open, task, role, canEvaluate, onClose }: EditTaskModalProps) {
  const [form] = Form.useForm<EditTaskFormValues>();
  const { mutate: updateTask, isPending: isTaskPending } = useUpdateMyTask();
  const { mutate: updateEvaluation, isPending: isEvaluationPending } =
    useUpdateMyTaskPmEvaluation();

  const effectiveRole = role ?? ROLES.EMPLOYEE;
  const editableFields = useMemo(
    () => getEditTaskFieldsForRole(effectiveRole, canEvaluate),
    [effectiveRole, canEvaluate],
  );

  const { data: staffOptions = [] } = useCreateTaskStaffOptions();
  const isProjectTask = task?.taskCategory === 'project';

  const designThinking = Form.useWatch('designThinking', form);
  const technical = Form.useWatch('technical', form);
  const contentProcessing = Form.useWatch('contentProcessing', form);

  const previewLevel: ClassificationLevel | undefined =
    designThinking != null && technical != null && contentProcessing != null
      ? computeTaskLevel(designThinking, technical, contentProcessing)
      : (task?.level as ClassificationLevel | undefined);

  const staffSelectOptions = useMemo(
    () => mergeStaffSelectOptions(staffOptions, task?.staff ?? []),
    [staffOptions, task?.staff],
  );

  const showLevelPreview = showsTaskLevelPreview(effectiveRole);
  const showEvaluationReadOnly = showsEvaluationReadOnly(effectiveRole, canEvaluate);
  const showClassification =
    hasField(editableFields, 'designThinking') ||
    hasField(editableFields, 'technical') ||
    hasField(editableFields, 'contentProcessing') ||
    hasField(editableFields, 'additionalFactors');
  const showEvaluationEditable =
    hasField(editableFields, 'completion') ||
    hasField(editableFields, 'evaluation') ||
    hasField(editableFields, 'pmNote');

  useEffect(() => {
    if (task && open) {
      form.setFieldsValue({
        taskName: task.taskName,
        quantity: task.quantity,
        date: dayjs(task.date),
        description: task.description,
        designThinking: task.designThinking,
        technical: task.technical,
        contentProcessing: task.contentProcessing,
        additionalFactors: task.additionalFactors,
        staffUserIds: task.staff.map((member) => staffOptionKey(member)),
        staffConfirmation: task.staffConfirmation,
        staffNote: task.staffNote,
        completionPercent: task.completionPercent ?? 0,
        pmEvaluation: task.pmEvaluation,
        pmNote: task.pmNote,
      });
    }
  }, [task, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: EditTaskFormValues) => {
    if (!task) return;

    const payload: UpdateMyTaskRequest = {
      taskName: hasField(editableFields, 'taskName') ? values.taskName : task.taskName,
      quantity: hasField(editableFields, 'quantity') ? values.quantity : task.quantity,
      date: hasField(editableFields, 'date') ? toTaskDateOnly(values.date) : task.date,
      description: hasField(editableFields, 'description')
        ? (values.description ?? '')
        : task.description,
      designThinking: hasField(editableFields, 'designThinking')
        ? values.designThinking
        : task.designThinking,
      technical: hasField(editableFields, 'technical') ? values.technical : task.technical,
      contentProcessing: hasField(editableFields, 'contentProcessing')
        ? values.contentProcessing
        : task.contentProcessing,
      additionalFactors: hasField(editableFields, 'additionalFactors')
        ? (values.additionalFactors ?? '')
        : task.additionalFactors,
      staff: hasField(editableFields, 'staff')
        ? resolveStaffFromUserIds(values.staffUserIds, staffOptions, task.staff)
        : task.staff,
      staffConfirmation: hasField(editableFields, 'confirmation')
        ? values.staffConfirmation
        : task.staffConfirmation,
      staffNote: hasField(editableFields, 'staffNote') ? (values.staffNote ?? '') : task.staffNote,
    };

    const saveEvaluation = showEvaluationEditable
      ? () => {
          updateEvaluation(
            {
              id: task.id,
              payload: {
                completionPercent: hasField(editableFields, 'completion')
                  ? (values.completionPercent ?? 0)
                  : (task.completionPercent ?? 0),
                pmEvaluation: hasField(editableFields, 'evaluation')
                  ? (values.pmEvaluation ?? '')
                  : task.pmEvaluation,
                pmNote: hasField(editableFields, 'pmNote') ? (values.pmNote ?? '') : task.pmNote,
              },
            },
            {
              onSuccess: () => {
                form.resetFields();
                onClose();
              },
            },
          );
        }
      : null;

    updateTask(
      { id: task.id, payload },
      {
        onSuccess: () => {
          if (saveEvaluation) {
            saveEvaluation();
            return;
          }
          form.resetFields();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title={task ? `Edit task — ${task.taskCode}` : 'Edit task'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save changes"
      confirmLoading={isTaskPending || isEvaluationPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {task && (
        <>
          <div className={styles.contextCard}>
            <div className={styles.contextItem}>
              <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectName}</span>
              <span className={styles.contextValue} title={task.projectName}>
                {task.projectName}
              </span>
            </div>
            <div className={styles.contextItem}>
              <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.projectManager}</span>
              <span
                className={styles.contextValue}
                title={`${task.projectManager.code} — ${task.projectManager.name}`}
              >
                {task.projectManager.code} — {task.projectManager.name}
              </span>
            </div>
            {task.department ? (
              <div className={styles.contextItem}>
                <span className={styles.readOnlyLabel}>Phòng ban</span>
                <span className={styles.contextValue}>
                  {task.department in DEPARTMENT_LABELS
                    ? DEPARTMENT_LABELS[task.department as ProjectDepartment]
                    : task.department}
                </span>
              </div>
            ) : null}
            {showLevelPreview ? (
              <div className={styles.contextItem}>
                <span className={styles.readOnlyLabel}>{MY_TASK_COLUMN_HEADERS.level}</span>
                <span className={styles.contextValue}>
                  {previewLevel ? CLASSIFICATION_LEVEL_LABELS[previewLevel] : '—'}
                </span>
              </div>
            ) : null}
          </div>

          {showEvaluationReadOnly ? (
            <div className={styles.pmFields}>
              <div className={styles.pmField}>
                {MY_TASK_COLUMN_HEADERS.completion}
                <div className={styles.pmValue}>
                  {task.completionPercent != null ? `${task.completionPercent}%` : '—'}
                </div>
              </div>
              <div className={styles.pmField}>
                {MY_TASK_COLUMN_HEADERS.evaluation}
                <div className={styles.pmValue}>{task.pmEvaluation || '—'}</div>
              </div>
              <div className={styles.pmField}>
                {MY_TASK_COLUMN_HEADERS.pmNote}
                <div className={styles.pmValue}>{task.pmNote || '—'}</div>
              </div>
            </div>
          ) : null}
        </>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={!task}
      >
        {hasField(editableFields, 'description') ||
        hasField(editableFields, 'taskName') ||
        hasField(editableFields, 'quantity') ||
        hasField(editableFields, 'date') ? (
          <section className={styles.section}>
            <p className={styles.sectionTitle}>Task</p>
            {hasField(editableFields, 'taskName') ? (
              <Form.Item
                name="taskName"
                label={MY_TASK_COLUMN_HEADERS.taskName}
                rules={[{ required: true, message: 'Task type is required' }]}
              >
                <Input />
              </Form.Item>
            ) : null}

            {hasField(editableFields, 'quantity') || hasField(editableFields, 'date') ? (
              <div
                className={
                  hasField(editableFields, 'quantity') && hasField(editableFields, 'date')
                    ? styles.row
                    : undefined
                }
              >
                {hasField(editableFields, 'quantity') ? (
                  <Form.Item
                    name="quantity"
                    label={MY_TASK_COLUMN_HEADERS.quantity}
                    rules={[{ required: true, message: 'Quantity is required' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                ) : null}
                {hasField(editableFields, 'date') ? (
                  <Form.Item
                    name="date"
                    label={MY_TASK_COLUMN_HEADERS.date}
                    rules={[{ required: true, message: 'Date is required' }]}
                  >
                    <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
                  </Form.Item>
                ) : null}
              </div>
            ) : null}

            {hasField(editableFields, 'description') ? (
              <Form.Item name="description" label={MY_TASK_COLUMN_HEADERS.description}>
                <Input.TextArea rows={3} placeholder="Add context or requirements" />
              </Form.Item>
            ) : null}
          </section>
        ) : null}

        {showClassification ? (
          <section className={styles.section}>
            <p className={styles.sectionTitle}>Classification</p>
            <div className={styles.rowThree}>
              {hasField(editableFields, 'designThinking') ? (
                <Form.Item
                  name="designThinking"
                  label={MY_TASK_COLUMN_HEADERS.designThinking}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
                </Form.Item>
              ) : null}
              {hasField(editableFields, 'technical') ? (
                <Form.Item
                  name="technical"
                  label={MY_TASK_COLUMN_HEADERS.technical}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
                </Form.Item>
              ) : null}
              {hasField(editableFields, 'contentProcessing') ? (
                <Form.Item
                  name="contentProcessing"
                  label={MY_TASK_COLUMN_HEADERS.contentProcessing}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select options={[...CLASSIFICATION_LEVEL_OPTIONS]} />
                </Form.Item>
              ) : null}
            </div>
            {hasField(editableFields, 'additionalFactors') ? (
              <Form.Item name="additionalFactors" label={MY_TASK_COLUMN_HEADERS.additionalFactors}>
                <Input placeholder="Optional factors" />
              </Form.Item>
            ) : null}
          </section>
        ) : null}

        {hasField(editableFields, 'staff') ? (
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
          </section>
        ) : null}

        {showEvaluationEditable ? (
          <section className={styles.section}>
            <p className={styles.sectionTitle}>Evaluation</p>
            {hasField(editableFields, 'completion') || hasField(editableFields, 'evaluation') ? (
              <div
                className={
                  hasField(editableFields, 'completion') && hasField(editableFields, 'evaluation')
                    ? styles.row
                    : undefined
                }
              >
                {hasField(editableFields, 'completion') ? (
                  <Form.Item
                    name="completionPercent"
                    label={MY_TASK_COLUMN_HEADERS.completion}
                    rules={[{ required: true, message: 'Completion is required' }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      precision={0}
                      addonAfter="%"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ) : null}
                {hasField(editableFields, 'evaluation') ? (
                  <Form.Item name="pmEvaluation" label={MY_TASK_COLUMN_HEADERS.evaluation}>
                    <Select
                      allowClear
                      placeholder="—"
                      options={[...PROJECT_EVALUATION_SCORE_OPTIONS]}
                    />
                  </Form.Item>
                ) : null}
              </div>
            ) : null}
            {hasField(editableFields, 'pmNote') ? (
              <Form.Item name="pmNote" label={MY_TASK_COLUMN_HEADERS.pmNote}>
                <Input.TextArea rows={3} placeholder="Add a note" />
              </Form.Item>
            ) : null}
          </section>
        ) : null}

        {hasField(editableFields, 'confirmation') || hasField(editableFields, 'staffNote') ? (
          <section className={styles.section}>
            <p className={styles.sectionTitle}>{MY_TASK_COLUMN_HEADERS.confirmation}</p>
            {hasField(editableFields, 'confirmation') ? (
              <Form.Item
                name="staffConfirmation"
                rules={[{ required: true, message: 'Confirmation is required' }]}
              >
                <Select options={[...TASK_STATUS_OPTIONS]} placeholder="Select status" />
              </Form.Item>
            ) : null}
            {hasField(editableFields, 'staffNote') ? (
              <Form.Item name="staffNote" label={TASK_STATUS_CHANGE_NOTE_LABEL}>
                <Input.TextArea rows={2} placeholder="Note for status change" />
              </Form.Item>
            ) : null}
          </section>
        ) : null}
      </Form>
    </Modal>
  );
}
