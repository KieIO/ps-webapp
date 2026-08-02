import { DatePicker, Form, Input, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { TaskUrgencySelect } from '@/features/tasks/components/TaskUrgencySelect/TaskUrgencySelect';
import { EVALUATION_LEVEL_OPTIONS, EVALUATION_LEVEL_LABELS, STATUS_OPTIONS } from '../../constants';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import { computeProjectLevel } from '../../utils/projectLevel';
import {
  emptyPerson,
  hasPersonUserId,
  mergePersonOptions,
  resolvePersonFromForm,
} from '../../utils/personRef';
import {
  EVALUATION_LEVELS,
  type EvaluationLevel,
  type Project,
  type UpdateProjectRequest,
} from '../../schemas/project.schema';
import { ClientSelectField } from '../ClientSelectField/ClientSelectField';
import styles from './EditProjectModal.module.scss';

interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

/** Project "Đánh giá" is a 1–4 score stored as string for API compatibility. */
const PROJECT_EVALUATION_OPTIONS = EVALUATION_LEVELS.map((value) => ({
  value: String(value),
  label: String(value),
}));

type EditProjectFormValues = Omit<UpdateProjectRequest, 'startDate' | 'endDate' | 'department'> & {
  startDate: Dayjs;
  endDate: Dayjs;
};

export function EditProjectModal({ open, project, onClose }: EditProjectModalProps) {
  const [form] = Form.useForm<EditProjectFormValues>();
  const { mutate, isPending } = useUpdateProject();
  const { data: headOptions = [] } = useProjectHeadOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const time = Form.useWatch('time', form);

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
      });
    }
  }, [project, open, form]);

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
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
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
      urgency: values.status === 'finish' || values.status === 'cancel' ? 'gray' : values.urgency,
    };

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
              <Select allowClear placeholder="—" options={PROJECT_EVALUATION_OPTIONS} />
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
      </Form>
    </Modal>
  );
}
