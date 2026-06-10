import { Form, Input, Modal, Select } from 'antd';
import { ROLES } from '@/config/permissions';
import { DEPARTMENT_OPTIONS, ROLE_OPTIONS } from '../../constants';
import { useCreateUser } from '../../hooks/useCreateUser';
import type { CreateUserRequest } from '../../schemas/user.schema';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateUserRequest = {
  name: '',
  email: '',
  role: ROLES.EMPLOYEE,
  department: 'project',
};

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const [form] = Form.useForm<CreateUserRequest>();
  const { mutate, isPending } = useCreateUser();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: CreateUserRequest) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        onClose();
      },
    });
  };

  return (
    <Modal
      title="Invite user"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Send invite"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={defaultValues}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Nguyen Van An" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="name@pokeslide.com" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <Select options={ROLE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Department is required' }]}
        >
          <Select options={DEPARTMENT_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
