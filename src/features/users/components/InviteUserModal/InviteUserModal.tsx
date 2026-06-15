import { Form, Input, Modal, Select, Typography } from 'antd';
import { ROLES } from '@/config/permissions';
import { DEFAULT_INVITE_PASSWORD, DEPARTMENT_OPTIONS, ROLE_OPTIONS } from '../../constants';
import { useCreateUser } from '../../hooks/useCreateUser';
import type { CreateUserRequest } from '../../schemas/user.schema';
import styles from './InviteUserModal.module.scss';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

type InviteUserFormValues = CreateUserRequest & {
  password?: string;
};

const defaultValues: InviteUserFormValues = {
  name: '',
  email: '',
  role: ROLES.EMPLOYEE,
  department: 'project',
  password: '',
};

export function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const [form] = Form.useForm<InviteUserFormValues>();
  const { mutate, isPending } = useCreateUser();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = (values: InviteUserFormValues) => {
    const password = values.password?.trim();
    const payload: CreateUserRequest = {
      name: values.name,
      email: values.email,
      role: values.role,
      department: values.department,
      ...(password ? { password } : {}),
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
      >
        <Typography.Text type="secondary" className={styles.legend}>
          Fields marked with <span className={styles.requiredMark}>*</span> are required.
        </Typography.Text>

        <Form.Item
          name="name"
          label="Full name"
          required
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Nguyen Van An" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          required
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="name@pokeslide.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password (optional)"
          required={false}
          extra={`Leave blank to use the default password (${DEFAULT_INVITE_PASSWORD}). Share the password with the user securely.`}
          rules={[
            {
              validator: (_, value: string | undefined) => {
                const trimmed = value?.trim();
                if (!trimmed) {
                  return Promise.resolve();
                }
                if (trimmed.length < 5) {
                  return Promise.reject(new Error('Password must be at least 5 characters'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password placeholder={DEFAULT_INVITE_PASSWORD} autoComplete="new-password" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          required
          rules={[{ required: true, message: 'Role is required' }]}
        >
          <Select options={ROLE_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          required
          rules={[{ required: true, message: 'Department is required' }]}
        >
          <Select options={DEPARTMENT_OPTIONS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
