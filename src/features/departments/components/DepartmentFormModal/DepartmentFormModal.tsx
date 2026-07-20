import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import { useCreateDepartment } from '../../hooks/useCreateDepartment';
import { useUpdateDepartment } from '../../hooks/useUpdateDepartment';
import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../../schemas/department.schema';
import { slugifyDepartmentCode } from '../../utils/slugifyDepartmentCode';

interface DepartmentFormModalProps {
  open: boolean;
  department?: Department | null;
  onClose: () => void;
}

type FormValues = {
  name: string;
  description: string;
};

export function DepartmentFormModal({ open, department, onClose }: DepartmentFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const isEdit = Boolean(department);
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (department) {
      form.setFieldsValue({
        name: department.name,
        description: department.description,
      });
      return;
    }
    form.resetFields();
  }, [open, department, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: FormValues) => {
    if (isEdit && department) {
      const payload: UpdateDepartmentRequest = {
        name: values.name,
        description: values.description ?? '',
      };
      updateDepartment(
        { id: department.id, payload },
        {
          onSuccess: () => {
            form.resetFields();
            onClose();
          },
        },
      );
      return;
    }

    const payload: CreateDepartmentRequest = {
      code: slugifyDepartmentCode(values.name),
      name: values.name,
      description: values.description ?? '',
    };
    createDepartment(payload, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title={isEdit ? 'Edit department' : 'Create department'}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={isEdit ? 'Save' : 'Create'}
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Project" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
