import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import { PROJECT_NAME_COLUMN_LABEL, PROJECT_TABLE_COLUMN_HEADERS } from '../../constants';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import { EVALUATION_LEVELS, type Project } from '../../schemas/project.schema';
import { buildUpdateProjectPayload } from '../../utils/buildUpdateProjectPayload';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

interface EvaluateProjectModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

/** Project "Đánh giá" is a 1–4 score stored as string for API compatibility. */
const PROJECT_EVALUATION_OPTIONS = EVALUATION_LEVELS.map((value) => ({
  value: String(value),
  label: String(value),
}));

type EvaluateProjectFormValues = {
  evaluation: string;
  note: string;
};

export function EvaluateProjectModal({ open, project, onClose }: EvaluateProjectModalProps) {
  const [form] = Form.useForm<EvaluateProjectFormValues>();
  const { mutate, isPending } = useUpdateProject();

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
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
            <span className={styles.readOnlyLabel}>{PROJECT_TABLE_COLUMN_HEADERS.completion}</span>
            <span className={styles.contextValue}>{project.completionPercent}%</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{PROJECT_TABLE_COLUMN_HEADERS.pmName}</span>
            <span className={styles.contextValue}>{project.pm.name || '—'}</span>
          </div>
        </div>
      ) : null}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item name="evaluation" label={PROJECT_TABLE_COLUMN_HEADERS.evaluation}>
          <Select allowClear placeholder="—" options={PROJECT_EVALUATION_OPTIONS} />
        </Form.Item>
        <Form.Item name="note" label={PROJECT_TABLE_COLUMN_HEADERS.note}>
          <Input.TextArea rows={3} placeholder="Add a note" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
