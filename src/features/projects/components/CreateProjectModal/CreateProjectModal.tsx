import { DatePicker, Form, Input, Modal, Select, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLES, type Role } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { TaskUrgencySelect } from '@/features/tasks/components/TaskUrgencySelect/TaskUrgencySelect';
import { EVALUATION_LEVEL_OPTIONS, EVALUATION_LEVEL_LABELS } from '../../constants';
import { useCreateProject } from '../../hooks/useCreateProject';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { useDepartmentOptions } from '@/features/departments/hooks/useDepartmentOptions';
import { CREATE_PROJECT_DEFAULTS, resolveCreateDepartment } from '../../utils/projectDefaults';
import { computeProjectLevel } from '../../utils/projectLevel';
import { emptyPerson, hasPersonUserId, resolvePersonFromForm } from '../../utils/personRef';
import type {
  CreateProjectRequest,
  EvaluationLevel,
  PersonWithCode,
  ProjectUrgency,
} from '../../schemas/project.schema';
import { ClientSelectField } from '../ClientSelectField/ClientSelectField';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

/** Roles that pre-fill Dept. head with the signed-in user when the modal opens. */
const DEPT_HEAD_AUTO_SELECT_ROLES: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.HEAD,
  ROLES.PM,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MANAGER,
];

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

/** Create form omits API fields that are defaulted server-side / at submit (not collected in UI). */
type CreateProjectFormValues = Omit<
  CreateProjectRequest,
  'startDate' | 'endDate' | 'department' | 'evaluation' | 'status'
> & {
  startDate: Dayjs;
  endDate: Dayjs;
  urgency: ProjectUrgency;
};

const buildDefaultValues = (): CreateProjectFormValues => ({
  clientId: '',
  name: '',
  startDate: dayjs(),
  endDate: dayjs().add(2, 'week'),
  urgency: 'auto',
  departmentHead: emptyPerson(),
  brief: '',
  volume: 2,
  nature: 2,
  time: 2,
  additionalFactors: '',
  pm: emptyPerson(),
  note: '',
});

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [form] = Form.useForm<CreateProjectFormValues>();
  const { mutate, isPending } = useCreateProject();
  const { data: headOptions = [] } = useProjectHeadOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();
  const { items: departmentItems } = useDepartmentOptions({ enabled: open });
  const currentUser = useAppSelector((state) => state.auth.user);

  const defaultDepartmentHead = useMemo((): PersonWithCode | undefined => {
    if (!currentUser?.id || !currentUser.role) return undefined;
    if (!DEPT_HEAD_AUTO_SELECT_ROLES.includes(currentUser.role as Role)) return undefined;

    const match = headOptions.find((entry) => entry.userId === currentUser.id);
    if (!match) return undefined;

    return { code: match.code, name: match.name, userId: match.userId };
  }, [currentUser, headOptions]);

  const volume = Form.useWatch('volume', form);
  const nature = Form.useWatch('nature', form);
  const time = Form.useWatch('time', form);

  const previewLevel: EvaluationLevel | undefined =
    volume != null && nature != null && time != null
      ? computeProjectLevel(volume, nature, time)
      : undefined;

  // Reset the form only when the modal opens — not when head options finish loading.
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(buildDefaultValues());
  }, [open, form]);

  // Prefill dept. head without wiping fields the user may already have entered.
  useEffect(() => {
    if (!open || !defaultDepartmentHead) return;
    const currentCode = form.getFieldValue(['departmentHead', 'code']);
    if (currentCode) return;
    form.setFieldValue('departmentHead', defaultDepartmentHead);
  }, [open, form, defaultDepartmentHead]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleDepartmentHeadSelect = (code: string | undefined) => {
    if (!code) {
      form.setFieldValue('departmentHead', emptyPerson());
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
      form.setFieldValue('pm', emptyPerson());
      return;
    }
    const pm = pmOptions.find((entry) => entry.code === code);
    if (pm) {
      form.setFieldValue('pm', { code: pm.code, name: pm.name, userId: pm.userId });
    }
  };

  const handleFinish = (values: CreateProjectFormValues) => {
    const stored = form.getFieldsValue(true) as CreateProjectFormValues;
    const departmentHead = resolvePersonFromForm(
      values.departmentHead,
      stored.departmentHead,
      headOptions,
    );
    const pm = resolvePersonFromForm(values.pm, stored.pm, pmOptions);

    if (!hasPersonUserId(departmentHead) || !hasPersonUserId(pm)) {
      message.error('Please select a department head and PM from the list');
      return;
    }

    const department = resolveCreateDepartment(departmentItems.map((entry) => entry.code));
    if (!department) {
      message.error(
        'No departments configured. Add one in Settings → Department management, then try again.',
      );
      return;
    }

    const payload: CreateProjectRequest = {
      ...CREATE_PROJECT_DEFAULTS,
      clientId: values.clientId,
      name: values.name,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      department,
      departmentHead,
      brief: values.brief ?? '',
      volume: values.volume,
      nature: values.nature,
      time: values.time,
      additionalFactors: values.additionalFactors ?? '',
      pm,
      note: values.note ?? '',
      urgency: values.urgency,
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
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </section>
      </Form>
    </Modal>
  );
}
