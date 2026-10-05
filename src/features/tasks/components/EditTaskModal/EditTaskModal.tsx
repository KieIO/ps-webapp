import { Alert, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATETIME_SHORT_FORMAT } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { ROLES } from '@/config/permissions';
import { getDepartmentLabel } from '@/features/departments/hooks/useDepartmentOptions';
import {
  CLASSIFICATION_LEVEL_LABELS,
  CLASSIFICATION_LEVEL_OPTIONS,
  MY_TASK_COLUMN_HEADERS,
  PROJECT_EVALUATION_SCORE_OPTIONS,
  TASK_STATUS_CHANGE_NOTE_LABEL,
  UNASSIGNED_STAFF_LABEL,
} from '../../constants';
import { useCreateTaskStaffOptions } from '../../hooks/useCreateTaskOptions';
import { useUpdateMyTask } from '../../hooks/useUpdateMyTask';
import { useUpdateMyTaskPmEvaluation } from '../../hooks/useUpdateMyTaskPmEvaluation';
import { computeTaskLevel } from '../../utils/taskLevel';
import { canEditCreativeDeadline as canEditCreativeDeadlineRole } from '../../utils/creativeVisibility';
import {
  getEditTaskFieldsForRole,
  requiresStaffOnGenericEdit,
  showsEvaluationReadOnly,
  showsTaskLevelPreview,
  type EditTaskField,
} from '../../utils/editTaskFields';
import { mergeStaffSelectOptions, resolveStaffFromUserId, staffOptionKey } from '../../utils/staff';
import { fromTaskDeadline, toTaskDeadline } from '../../utils/taskDates';
import { getTaskDeadline } from '../../utils/taskDetail';
import { resolveWholeAssignStaff } from '../../utils/creativePipeline';
import {
  canCancelTask,
  canChangeTaskStatus,
  confirmCancelTask,
  getTaskStatusOptionsForRole,
  isTransitioningToCancelled,
  TASK_STATUS_LOCKED_MESSAGE,
} from '../../utils/taskStatusLock';
import type { ClassificationLevel, MyTask, UpdateMyTaskRequest } from '../../schemas/task.schema';
import { TaskUrgencySelect } from '../TaskUrgencySelect/TaskUrgencySelect';
import styles from './EditTaskModal.module.scss';

interface EditTaskModalProps {
  open: boolean;
  task: MyTask | null;
  role: Role;
  canEvaluate: boolean;
  onClose: () => void;
}

type EditTaskFormValues = Omit<UpdateMyTaskRequest, 'date' | 'staff' | 'creativeDeadline'> & {
  date: Dayjs;
  creativeDeadline?: Dayjs;
  staffUserId?: string;
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
  const staffRequired = Boolean(task && requiresStaffOnGenericEdit(task));

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
  const canEditCreativeDeadline = canEditCreativeDeadlineRole(effectiveRole);
  const showClassification =
    hasField(editableFields, 'designThinking') ||
    hasField(editableFields, 'technical') ||
    hasField(editableFields, 'contentProcessing') ||
    hasField(editableFields, 'additionalFactors');
  const showEvaluationEditable =
    hasField(editableFields, 'completion') ||
    hasField(editableFields, 'evaluation') ||
    hasField(editableFields, 'pmNote');
  const statusEditable = task ? canChangeTaskStatus(task, effectiveRole) : true;
  const statusOptions = useMemo(
    () => getTaskStatusOptionsForRole(effectiveRole, task?.staffConfirmation),
    [effectiveRole, task?.staffConfirmation],
  );

  useEffect(() => {
    if (task && open) {
      const wholeStaff = resolveWholeAssignStaff(task)[0] ?? task.staff[0];
      form.setFieldsValue({
        taskName: task.taskName,
        quantity: task.quantity,
        date: fromTaskDeadline(getTaskDeadline(task)),
        creativeDeadline: task.creativeDeadline
          ? fromTaskDeadline(task.creativeDeadline)
          : undefined,
        description: task.description,
        designThinking: task.designThinking,
        technical: task.technical,
        contentProcessing: task.contentProcessing,
        additionalFactors: task.additionalFactors,
        staffUserId: wholeStaff ? staffOptionKey(wholeStaff) : undefined,
        staffConfirmation: task.staffConfirmation,
        staffNote: task.staffNote,
        urgency: task.urgency,
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

  const handleFinish = async (values: EditTaskFormValues) => {
    if (!task) return;

    const nextConfirmation = hasField(editableFields, 'confirmation')
      ? values.staffConfirmation
      : task.staffConfirmation;

    if (!canChangeTaskStatus(task, effectiveRole) && nextConfirmation !== task.staffConfirmation) {
      return;
    }

    if (isTransitioningToCancelled(task.staffConfirmation, nextConfirmation)) {
      if (!canCancelTask(effectiveRole)) return;
      const confirmed = await confirmCancelTask();
      if (!confirmed) return;
    }

    const nextStaff = (() => {
      if (!hasField(editableFields, 'staff')) return task.staff.slice(0, 1);
      if (values.staffUserId) {
        return resolveStaffFromUserId(values.staffUserId, staffOptions, task.staff);
      }
      // Creative pipeline tasks: do not wipe assignees when Staff is optional / empty.
      if (!staffRequired && task.taskCategory === 'project') {
        return task.staff;
      }
      return [];
    })();

    const payload: UpdateMyTaskRequest = {
      taskName: hasField(editableFields, 'taskName') ? values.taskName : task.taskName,
      quantity: hasField(editableFields, 'quantity') ? values.quantity : task.quantity,
      date: hasField(editableFields, 'date')
        ? toTaskDeadline(values.date)
        : (task.deadline ?? task.date),
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
      staff: nextStaff,
      staffConfirmation: nextConfirmation,
      staffNote: hasField(editableFields, 'staffNote') ? (values.staffNote ?? '') : task.staffNote,
      urgency: hasField(editableFields, 'urgency') ? values.urgency : task.urgency,
      creativeDeadline: canEditCreativeDeadline
        ? values.creativeDeadline
          ? toTaskDeadline(values.creativeDeadline)
          : undefined
        : (task.creativeDeadline ?? undefined),
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
              <span className={styles.contextValue} title={task.projectManager.name}>
                {task.projectManager.name}
              </span>
            </div>
            {task.department ? (
              <div className={styles.contextItem}>
                <span className={styles.readOnlyLabel}>Phòng ban</span>
                <span className={styles.contextValue}>{getDepartmentLabel(task.department)}</span>
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
        hasField(editableFields, 'date') ||
        hasField(editableFields, 'urgency') ? (
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

            {hasField(editableFields, 'quantity') ||
            hasField(editableFields, 'date') ||
            hasField(editableFields, 'urgency') ? (
              <>
                {hasField(editableFields, 'quantity') ? (
                  <Form.Item
                    name="quantity"
                    label={MY_TASK_COLUMN_HEADERS.quantity}
                    rules={[{ required: true, message: 'Quantity is required' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                ) : null}
                {hasField(editableFields, 'date') || hasField(editableFields, 'urgency') ? (
                  <div
                    className={
                      hasField(editableFields, 'date') && hasField(editableFields, 'urgency')
                        ? styles.row
                        : undefined
                    }
                  >
                    {hasField(editableFields, 'date') ? (
                      <Form.Item
                        name="date"
                        label={MY_TASK_COLUMN_HEADERS.date}
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
                    ) : null}
                    {hasField(editableFields, 'urgency') ? (
                      <Form.Item
                        name="urgency"
                        label={MY_TASK_COLUMN_HEADERS.urgency}
                        rules={[{ required: true, message: 'Urgency is required' }]}
                      >
                        <TaskUrgencySelect />
                      </Form.Item>
                    ) : null}
                  </div>
                ) : null}
                {canEditCreativeDeadline ? (
                  <Form.Item
                    name="creativeDeadline"
                    label={MY_TASK_COLUMN_HEADERS.creativeDeadline}
                  >
                    <DatePicker
                      showTime={{
                        format: 'HH:mm',
                        defaultValue: dayjs().second(0).millisecond(0),
                      }}
                      format={DATETIME_SHORT_FORMAT}
                      style={{ width: '100%' }}
                      showNow={false}
                    />
                  </Form.Item>
                ) : null}
              </>
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
              name="staffUserId"
              label={MY_TASK_COLUMN_HEADERS.staffName}
              rules={
                staffRequired
                  ? [{ required: true, message: 'Select a staff member for this project task' }]
                  : []
              }
            >
              <Select
                allowClear={!staffRequired}
                showSearch
                optionFilterProp="label"
                placeholder={staffRequired ? 'Select staff for this task' : UNASSIGNED_STAFF_LABEL}
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
            {!statusEditable ? (
              <Alert
                type="info"
                showIcon
                message={TASK_STATUS_LOCKED_MESSAGE}
                style={{ marginBottom: 12 }}
              />
            ) : null}
            {hasField(editableFields, 'confirmation') ? (
              <Form.Item
                name="staffConfirmation"
                rules={[{ required: true, message: 'Confirmation is required' }]}
              >
                <Select
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={!statusEditable}
                />
              </Form.Item>
            ) : null}
            {hasField(editableFields, 'staffNote') ? (
              <Form.Item name="staffNote" label={TASK_STATUS_CHANGE_NOTE_LABEL}>
                <Input.TextArea
                  rows={2}
                  placeholder="Note for status change"
                  disabled={!statusEditable}
                />
              </Form.Item>
            ) : null}
          </section>
        ) : null}
      </Form>
    </Modal>
  );
}
