import { Form, Modal, Select } from 'antd';
import { useEffect, useMemo } from 'react';
import { PROJECT_NAME_COLUMN_LABEL, PROJECT_TABLE_COLUMN_HEADERS } from '../../constants';
import { useProjectHeadOptions, useProjectPmOptions } from '../../hooks/useProjectList';
import { useUpdateProject } from '../../hooks/useUpdateProject';
import type { Project } from '../../schemas/project.schema';
import { buildUpdateProjectPayload } from '../../utils/buildUpdateProjectPayload';
import { mergePersonOptions, resolvePersonRef } from '../../utils/personRef';
import styles from '../EditProjectModal/EditProjectModal.module.scss';

interface AssignProjectStaffModalProps {
  open: boolean;
  project: Project | null;
  onClose: () => void;
}

type AssignProjectStaffFormValues = {
  departmentHeadCode: string;
  pmCode: string;
};

const formatMemberNames = (project: Project) =>
  project.members
    .map((member) => member.name)
    .filter(Boolean)
    .join(', ') || '—';

export function AssignProjectStaffModal({ open, project, onClose }: AssignProjectStaffModalProps) {
  const [form] = Form.useForm<AssignProjectStaffFormValues>();
  const { mutate, isPending } = useUpdateProject();
  const { data: headOptions = [] } = useProjectHeadOptions();
  const { data: pmOptions = [] } = useProjectPmOptions();

  const departmentHeadSelectOptions = useMemo(
    () => mergePersonOptions(headOptions, project?.departmentHead),
    [headOptions, project?.departmentHead],
  );

  const pmSelectOptions = useMemo(
    () => mergePersonOptions(pmOptions, project?.pm),
    [pmOptions, project?.pm],
  );

  useEffect(() => {
    if (open && project) {
      form.setFieldsValue({
        departmentHeadCode: project.departmentHead.code,
        pmCode: project.pm.code,
      });
    }
  }, [open, project, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: AssignProjectStaffFormValues) => {
    if (!project) return;

    mutate(
      {
        id: project.id,
        payload: buildUpdateProjectPayload(project, {
          departmentHead: resolvePersonRef(
            values.departmentHeadCode,
            departmentHeadSelectOptions,
            project.departmentHead,
          ),
          pm: resolvePersonRef(values.pmCode, pmSelectOptions, project.pm),
        }),
        successMessage: 'Project staff assigned',
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
      title={project ? `Assign staff — ${project.code}` : 'Assign staff'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Assign"
      confirmLoading={isPending}
      destroyOnHidden
      width={520}
    >
      {project ? (
        <div className={styles.contextCard}>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{PROJECT_NAME_COLUMN_LABEL}</span>
            <span className={styles.contextValue}>{project.name}</span>
          </div>
          <div className={styles.contextItem}>
            <span className={styles.readOnlyLabel}>{PROJECT_TABLE_COLUMN_HEADERS.members}</span>
            <span className={styles.contextValue}>{formatMemberNames(project)}</span>
          </div>
        </div>
      ) : null}

      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <p className={styles.sectionTitle}>People</p>
        <div className={styles.row}>
          <Form.Item
            name="departmentHeadCode"
            label={PROJECT_TABLE_COLUMN_HEADERS.headName}
            rules={[{ required: true, message: 'Department head is required' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select department head"
              options={departmentHeadSelectOptions.map((head) => ({
                value: head.code,
                label: head.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="pmCode"
            label={PROJECT_TABLE_COLUMN_HEADERS.pmName}
            rules={[{ required: true, message: 'PM is required' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select PM"
              options={pmSelectOptions.map((pm) => ({
                value: pm.code,
                label: pm.name,
              }))}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
