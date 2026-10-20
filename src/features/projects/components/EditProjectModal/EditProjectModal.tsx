import { DatePicker, Form, Input, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { TaskUrgencySelect } from '@/features/tasks/components/TaskUrgencySelect/TaskUrgencySelect';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  EVALUATION_LEVEL_OPTIONS,
  EVALUATION_LEVEL_LABELS,
  EVALUATION_SCORE_OPTIONS,
  STATUS_OPTIONS,
} from '../../constants';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import { canManageProjectMilestones } from '../../utils/milestoneAuth';
import { formRowsToMilestoneInputs, milestonesToFormRows } from '../../utils/milestoneForm';
import { toReplaceMilestonePayload } from '../../utils/milestoneValidation';
import { validateMilestones } from '../../utils/milestoneValidation';
import { computeProjectLevel } from '../../utils/projectLevel';
import {
  emptyPerson,
  hasPersonUserId,
  mergePersonOptions,
  resolvePersonFromForm,
} from '../../utils/personRef';
import {
  type EvaluationLevel,
  type Project,
  type UpdateProjectRequest,
} from '../../schemas/project.schema';
import { ClientSelectField } from '../ClientSelectField/ClientSelectField';
import {
  ProjectMilestonesFields,
  type MilestoneFormRow,
} from '../ProjectMilestonesFields/ProjectMilestonesFields';
import styles from './EditProjectModal.module.scss';

interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

type EditProjectFormValues = Omit<
  UpdateProjectRequest,
  'startDate' | 'endDate' | 'department' | 'milestones'
> & {
  startDate: Dayjs;
  endDate: Dayjs;
  milestones?: MilestoneFormRow[];
};

export function EditProjectModal({ open, project, onClose }: EditProjectModalProps) {
  const [form] = Form.useForm<EditProjectFormValues>();
  const { mutate, isPending } = useUpdateProject();
  const { data: headOptions = [] } = useProjectHeadOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();
  const role = useAppSelector((state) => state.auth.user?.role) as Role | undefined;
  const canEditMilestones = canManageProjectMilestones(role);

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const time = Form.useWatch('time', form);
  const watchedStart = Form.useWatch('startDate', form);
  const watchedEnd = Form.useWatch('endDate', form);

  const previewLevel: EvaluationLevel | undefined =
    volume != null && nature != null && time != null
      ? computeProjectLevel(volume, nature, time)
      : (project?.projectLevel as EvaluationLevel | undefined);

  const departmentHeadSelectOptions = useMemo(
    () => mergePersonOptions(headOptions, project?.departmentHead),
    [headOptions, project?.departmentHead],
  );

  const pmSelectOptions = useMemo(
    () => mergePersonOptions(pmOptions, project?.pm),
    [pmOptions, project?.pm],
  );

  useEffect(() => {
    if (project && open) {
      form.setFieldsValue({
        clientId: project.clientId,
        name: project.name,
        startDate: dayjs(project.startDate),
        endDate: dayjs(project.endDate),
        departmentHead: { ...project.departmentHead },
        brief: project.brief,
        volume: project.volume,
        nature: project.nature,
        time: project.time,
        additionalFactors: project.additionalFactors,
        pm: { ...project.pm },
        evaluation: project.evaluation,
        note: project.note,
        status: project.status,
        urgency: project.urgency,
        milestones: canEditMilestones ? milestonesToFormRows(project.milestones) : undefined,
      });
    }
  }, [project, open, form, canEditMilestones]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleDepartmentHeadSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('departmentHead', emptyPerson());
      return;
    }
    const head = departmentHeadSelectOptions.find((entry) => entry.code === code);
    if (head) {
      form.setFieldValue('departmentHead', {
        code: head.code,
        name: head.name,
        userId: head.userId,
      });
    }
  };

  const handlePmSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('pm', emptyPerson());
      return;
    }
    const pm = pmSelectOptions.find((entry) => entry.code === code);
    if (pm) {
      form.setFieldValue('pm', { code: pm.code, name: pm.name, userId: pm.userId });
    }
  };

  const handleFinish = (values: EditProjectFormValues) => {
    if (!project) return;

    const stored = form.getFieldsValue(true) as EditProjectFormValues;
    const departmentHead = resolvePersonFromForm(
      values.departmentHead,
      stored.departmentHead,
      departmentHeadSelectOptions,
      project.departmentHead,
    );
    const pm = resolvePersonFromForm(values.pm, stored.pm, pmSelectOptions, project.pm);

    if (!hasPersonUserId(departmentHead) || !hasPersonUserId(pm)) {
      message.error('Please select a department head and PM from the list');
      return;
    }

    const payload: UpdateProjectRequest = {
      clientId: values.clientId,
      name: values.name,
      // Calendar dates in VN (YYYY-MM-DD) — avoid toISOString UTC day-shift on Tracker.
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      // Department is owned by tasks (task score group); keep existing project value.
      department: project.department,
      departmentHead,
      brief: values.brief ?? '',
      volume: values.volume,
      nature: values.nature,
      time: values.time,
      additionalFactors: values.additionalFactors ?? '',
      pm,
      evaluation: values.evaluation ?? '',
      note: values.note ?? '',
      status: values.status,
      urgency: values.urgency,
    };

    if (canEditMilestones) {
      const milestoneInputs = formRowsToMilestoneInputs(values.milestones);
      const check = validateMilestones(milestoneInputs, {
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        totalSlides: project.totalSlides,
      });
      if (!check.ok) {
        message.error(check.message);
        return;
      }
      payload.milestones = toReplaceMilestonePayload(milestoneInputs);
    }

    mutate(
      { id: project.id, payload },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title={project ? `Edit project — ${project.code}` : 'Edit project'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save changes"
      confirmLoading={isPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {project ? (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>Project code</span>
            <span className={styles.contextValue}>{project.code}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>Calculated level</span>
            <span className={styles.contextValue}>
              {previewLevel ? EVALUATION_LEVEL_LABELS[previewLevel] : '—'}
            </span>
          </div>
        </div>
      ) : null}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={!project}
      >
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Project</p>
          <div className={styles.row}>
            <Form.Item
              name="name"
              label="Project name"
              rules={[{ required: true, message: 'Project name is required' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Client is required' }]}
            >
              <ClientSelectField />
            </Form.Item>
          </div>

          <div className={styles.row}>
            <Form.Item
              name="startDate"
              label="Start date"
              rules={[{ required: true, message: 'Start date is required' }]}
            >
              <DatePicker format={DATE_FORMAT} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End date"
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

          <Form.Item name="brief" label="Brief">
            <Input.TextArea rows={2} />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>People</p>
          <div className={styles.row}>
            <Form.Item
              name={['departmentHead', 'code']}
              label="Dept. head"
              rules={[{ required: true, message: 'Department head is required' }]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select department head"
                onChange={handleDepartmentHeadSelect}
                options={departmentHeadSelectOptions.map((head) => ({
                  value: head.code,
                  label: head.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name={['pm', 'code']}
              label="PM"
              rules={[{ required: true, message: 'PM is required' }]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select PM"
                onChange={handlePmSelect}
                options={pmSelectOptions.map((pm) => ({
                  value: pm.code,
                  label: pm.name,
                }))}
              />
            </Form.Item>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Evaluation</p>
          <div className={styles.rowThree}>
            <Form.Item
              name="volume"
              label="Volume"
              rules={[{ required: true, message: 'Volume is required' }]}
            >
              <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
            </Form.Item>
            <Form.Item
              name="nature"
              label="Nature"
              rules={[{ required: true, message: 'Nature is required' }]}
            >
              <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
            </Form.Item>
            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Time is required' }]}
            >
              <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
            </Form.Item>
          </div>
          <Form.Item name="additionalFactors" label="Additional factors">
            <Input />
          </Form.Item>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Status</p>
          <div className={styles.row}>
            <Form.Item name="evaluation" label="Đánh giá">
              <Select allowClear placeholder="—" options={[...EVALUATION_SCORE_OPTIONS]} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Project status"
              rules={[{ required: true, message: 'Status is required' }]}
            >
              <Select options={[...STATUS_OPTIONS]} />
            </Form.Item>
          </div>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </section>

        {canEditMilestones ? (
          <ProjectMilestonesFields startDate={watchedStart} endDate={watchedEnd} showCompleted />
        ) : null}
      </Form>
    </Modal>
  );
}
