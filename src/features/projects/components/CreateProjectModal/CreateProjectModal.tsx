import { DatePicker, Form, Input, Modal, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { EVALUATION_LEVEL_OPTIONS, EVALUATION_LEVEL_LABELS, STATUS_OPTIONS } from '../../constants';
import { useCreateProject } from '../../hooks/useCreateProject';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { computeProjectLevel } from '../../utils/projectLevel';
import { resolvePersonRef } from '../../utils/personRef';
import type { CreateProjectRequest, EvaluationLevel } from '../../schemas/project.schema';
import { ClientSelectField } from '../ClientSelectField/ClientSelectField';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

type CreateProjectFormValues = Omit<
  CreateProjectRequest,
  'startDate' | 'endDate' | 'department' | 'evaluation'
> & {
  startDate: Dayjs;
  endDate: Dayjs;
};

/** Department is assigned on tasks (via task score group), not in project create UI. */
const DEFAULT_PROJECT_DEPARTMENT = 'project' as const;

const DEFAULT_VALUES: CreateProjectFormValues = {
  clientId: '',
  name: '',
  startDate: dayjs(),
  endDate: dayjs().add(2, 'week'),
  departmentHead: { code: '', name: '' },
  brief: '',
  volume: 2,
  nature: 2,
  time: 2,
  additionalFactors: '',
  pm: { code: '', name: '' },
  note: '',
  status: 'not_updated',
};

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm<CreateProjectFormValues>();
  const { mutate, isPending } = useCreateProject();
  const { data: headOptions = [] } = useProjectHeadOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const time = Form.useWatch('time', form);

  const previewLevel: EvaluationLevel | undefined =
    volume != null && nature != null && time != null
      ? computeProjectLevel(volume, nature, time)
      : undefined;

  useEffect(() => {
    if (open) {
      form.setFieldsValue(DEFAULT_VALUES);
    }
  }, [open, form]);

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
      form.setFieldValue('departmentHead', {
        code: head.code,
        name: head.name,
        userId: head.userId,
      });
    }
  };

  const handlePmSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('pm', { code: '', name: '' });
      return;
    }
    const pm = pmOptions.find((entry) => entry.code === code);
    if (pm) {
      form.setFieldValue('pm', { code: pm.code, name: pm.name, userId: pm.userId });
    }
  };

  const handleFinish = (values: CreateProjectFormValues) => {
    const payload: CreateProjectRequest = {
      clientId: values.clientId,
      name: values.name,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      department: DEFAULT_PROJECT_DEPARTMENT,
      departmentHead: resolvePersonRef(
        values.departmentHead?.code,
        headOptions,
        values.departmentHead,
      ),
      brief: values.brief ?? '',
      volume: values.volume,
      nature: values.nature,
      time: values.time,
      additionalFactors: values.additionalFactors ?? '',
      pm: resolvePersonRef(values.pm?.code, pmOptions, values.pm),
      evaluation: '',
      note: values.note ?? '',
      status: values.status,
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
      title="Create project"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Create project"
      confirmLoading={isPending}
      destroyOnHidden
      width={720}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
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
                options={headOptions.map((head) => ({
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
                options={pmOptions.map((pm) => ({
                  value: pm.code,
                  label: pm.name,
                }))}
              />
            </Form.Item>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.sectionTitle}>Evaluation</p>
          {previewLevel != null ? (
            <div className={styles.contextCard}>
              <div className={styles.contextItem}>
                <span className={styles.readOnlyLabel}>Calculated level</span>
                <span className={styles.contextValue}>{EVALUATION_LEVEL_LABELS[previewLevel]}</span>
              </div>
            </div>
          ) : null}
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
          <Form.Item
            name="status"
            label="Project status"
            rules={[{ required: true, message: 'Status is required' }]}
          >
            <Select options={[...STATUS_OPTIONS]} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
