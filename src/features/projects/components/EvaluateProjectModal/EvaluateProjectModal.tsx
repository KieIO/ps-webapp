import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import {
  EVALUATION_SCORE_OPTIONS,
  PROJECT_NAME_COLUMN_LABEL,
  PROJECT_TABLE_COLUMN_HEADERS,
} from '../../constants';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import type { Project } from '../../schemas/project.schema';
import { buildUpdateProjectPayload } from '../../utils/buildUpdateProjectPayload';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

interface EvaluateProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

type EvaluateProjectFormValues = {
  completionPercent: number;
  evaluation: string;
  note: string;
};

export function EvaluateProjectModal({ open, project, onClose }: EvaluateProjectModalProps) {
  const [form] = Form.useForm<EvaluateProjectFormValues>();
  const { mutate, isPending } = useUpdateProject();

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        completionPercent: project.completionPercent ?? 0,
        evaluation: project.evaluation,
        note: project.note,
      });
    }
  }, [open, project, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: EvaluateProjectFormValues) => {
    if (!project) return;

    mutate(
      {
        id: project.id,
        payload: buildUpdateProjectPayload(project, {
          completionPercent: values.completionPercent,
          evaluation: values.evaluation ?? '',
          note: values.note ?? '',
        }),
        successMessage: 'Project evaluation saved',
      },
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
      title="Evaluate project"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Save"
      confirmLoading={isPending}
      destroyOnHidden
      width={480}
    >
      {project ? (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{PROJECT_NAME_COLUMN_LABEL}</span>
            <span className={styles.contextValue}>{project.name}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{PROJECT_TABLE_COLUMN_HEADERS.pmName}</span>
            <span className={styles.contextValue}>{project.pm.name || '—'}</span>
          </div>
        </div>
      ) : null}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="completionPercent"
          label={PROJECT_TABLE_COLUMN_HEADERS.completion}
          rules={[{ required: true, message: 'Completion is required' }]}
        >
          <InputNumber min={0} max={100} precision={0} addonAfter="%" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="evaluation" label={PROJECT_TABLE_COLUMN_HEADERS.evaluation}>
          <Select allowClear placeholder="—" options={[...EVALUATION_SCORE_OPTIONS]} />
        </Form.Item>
        <Form.Item name="note" label={PROJECT_TABLE_COLUMN_HEADERS.note}>
          <Input.TextArea rows={3} placeholder="Add a note" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
