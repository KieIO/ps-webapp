import { Form, Input, Modal, Select, message } from 'antd';
import { useEffect } from 'react';
import type { Role } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import {
  PROJECT_NAME_COLUMN_LABEL,
  PROJECT_TABLE_COLUMN_HEADERS,
  STATUS_OPTIONS,
} from '../../constants';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import type { Project, ProjectStatus } from '../../schemas/project.schema';
import { buildUpdateProjectPayload } from '../../utils/buildUpdateProjectPayload';
import { requiresProjectStatusChangeReason } from '../../utils/projectEditAuth';
import { ProjectStatusBadge } from '../ProjectStatusBadge/ProjectStatusBadge';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

interface UpdateProjectStatusModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

type UpdateProjectStatusFormValues = {
  status: ProjectStatus;
  note: string;
  changeReason?: string;
};

export function UpdateProjectStatusModal({
  open,
  project,
  onClose,
}: UpdateProjectStatusModalProps) {
  const [form] = Form.useForm<UpdateProjectStatusFormValues>();
  const { mutate, isPending } = useUpdateProject();
  const role = useAppSelector((state) => state.auth.user?.role) as Role | undefined;
  const watchedStatus = Form.useWatch('status', form) as ProjectStatus | undefined;
  const needsStatusChangeReason = requiresProjectStatusChangeReason(
    role,
    project?.status,
    watchedStatus,
  );

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        status: project.status,
        note: project.note,
        changeReason: undefined,
      });
    }
  }, [open, project, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: UpdateProjectStatusFormValues) => {
    if (!project) return;

    if (requiresProjectStatusChangeReason(role, project.status, values.status)) {
      const reason = (values.changeReason ?? '').trim();
      if (!reason) {
        form.setFields([{ name: 'changeReason', errors: ['Nhập lý do thay đổi trạng thái'] }]);
        message.warning('Nhập lý do thay đổi trạng thái rồi bấm Save.');
        return;
      }
    }

    mutate(
      {
        id: project.id,
        payload: buildUpdateProjectPayload(project, {
          status: values.status,
          note: values.note ?? '',
          ...(requiresProjectStatusChangeReason(role, project.status, values.status)
            ? { changeReason: (values.changeReason ?? '').trim() }
            : {}),
        }),
        successMessage: 'Project status updated',
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
      title="Update status"
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
            <span className={styles.readOnlyLabel}>{PROJECT_TABLE_COLUMN_HEADERS.status}</span>
            <span className={styles.contextValue}>
              <ProjectStatusBadge status={project.status} />
            </span>
          </div>
        </div>
      ) : null}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="status"
          label={PROJECT_TABLE_COLUMN_HEADERS.status}
          rules={[{ required: true, message: 'Status is required' }]}
        >
          <Select options={[...STATUS_OPTIONS]} placeholder="Select status" />
        </Form.Item>
        {needsStatusChangeReason ? (
          <Form.Item
            name="changeReason"
            label="Lý do thay đổi trạng thái"
            rules={[{ required: true, message: 'Nhập lý do thay đổi trạng thái' }]}
            extra="Bắt buộc khi PM đổi status (ghi nhận audit)."
          >
            <Input.TextArea
              rows={2}
              placeholder="Ví dụ: reopen project theo yêu cầu client / điều chỉnh sau review"
            />
          </Form.Item>
        ) : null}
        <Form.Item name="note" label={PROJECT_TABLE_COLUMN_HEADERS.note}>
          <Input.TextArea rows={3} placeholder="Add a note for this status change" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
