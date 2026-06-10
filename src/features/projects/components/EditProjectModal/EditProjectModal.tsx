import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import {
  DEPARTMENT_OPTIONS,
  EVALUATION_LEVEL_OPTIONS,
  EVALUATION_LEVEL_LABELS,
  STATUS_OPTIONS,
} from '../../constants';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import { computeProjectLevel } from '../../utils/projectLevel';
import type { EvaluationLevel, Project, UpdateProjectRequest } from '../../schemas/project.schema';
import styles from './EditProjectModal.module.scss';

interface EditProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

type EditProjectFormValues = Omit<UpdateProjectRequest, 'startDate' | 'endDate'> & {
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

  useEffect(() => {
    if (project && open) {
      form.setFieldsValue({
        client: project.client,
        name: project.name,
        startDate: dayjs(project.startDate),
        endDate: dayjs(project.endDate),
        department: project.department,
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
      });
    }
  }, [project, open, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleDepartmentHeadSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('departmentHead', { code: '', name: '' });
      return;
    }
    const head = headOptions.find((entry) => entry.code === code);
    if (head) {
      form.setFieldValue('departmentHead', { code: head.code, name: head.name });
    }
  };

  const handlePmSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('pm', { code: '', name: '' });
      return;
    }
    const pm = pmOptions.find((entry) => entry.code === code);
    if (pm) {
      form.setFieldValue('pm', { code: pm.code, name: pm.name });
    }
  };

  const handleFinish = (values: EditProjectFormValues) => {
    if (!project) return;

    const payload: UpdateProjectRequest = {
      client: values.client,
      name: values.name,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      department: values.department,
      departmentHead: values.departmentHead,
      brief: values.brief ?? '',
      volume: values.volume,
      nature: values.nature,
      time: values.time,
      additionalFactors: values.additionalFactors ?? '',
      pm: values.pm,
      evaluation: values.evaluation ?? '',
      note: values.note ?? '',
      status: values.status,
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
      {project && (
        <p className={styles.readOnly}>
          <span className={styles.readOnlyLabel}>Project code:</span>
          {project.code}
          <span className={styles.readOnlyLabel}>Calculated level:</span>
          {previewLevel ? EVALUATION_LEVEL_LABELS[previewLevel] : '—'}
        </p>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        disabled={!project}
      >
        <p className={styles.sectionTitle}>Project details</p>
        <div className={styles.row}>
          <Form.Item
            name="name"
            label="Project name"
            rules={[{ required: true, message: 'Project name is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="client"
            label="Client"
            rules={[{ required: true, message: 'Client is required' }]}
          >
            <Input />
          </Form.Item>
        </div>

        <Form.Item
          name="department"
          label="Phòng ban"
          rules={[{ required: true, message: 'Phòng ban is required' }]}
        >
          <Select options={[...DEPARTMENT_OPTIONS]} />
        </Form.Item>

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

        <Form.Item name="brief" label="Brief">
          <Input.TextArea rows={2} />
        </Form.Item>

        <p className={styles.sectionTitle}>Department head</p>
        <Form.Item
          name={['departmentHead', 'code']}
          label="Dept. head name"
          rules={[{ required: true, message: 'Department head is required' }]}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select department head"
            onChange={handleDepartmentHeadSelect}
            options={headOptions.map((head) => ({
              value: head.code,
              label: head.name,
            }))}
          />
        </Form.Item>

        <p className={styles.sectionTitle}>Project evaluation</p>
        <div className={styles.row}>
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
        </div>
        <div className={styles.row}>
          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Time is required' }]}
          >
            <Select options={[...EVALUATION_LEVEL_OPTIONS]} />
          </Form.Item>
          <Form.Item name="additionalFactors" label="Additional factors">
            <Input />
          </Form.Item>
        </div>

        <p className={styles.sectionTitle}>Project manager</p>
        <Form.Item
          name={['pm', 'code']}
          label="PM name"
          rules={[{ required: true, message: 'PM is required' }]}
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Select PM"
            onChange={handlePmSelect}
            options={pmOptions.map((pm) => ({
              value: pm.code,
              label: pm.name,
            }))}
          />
        </Form.Item>

        <p className={styles.sectionTitle}>Quality & status</p>
        <div className={styles.row}>
          <Form.Item name="evaluation" label="Evaluation">
            <Input />
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
      </Form>
    </Modal>
  );
}
