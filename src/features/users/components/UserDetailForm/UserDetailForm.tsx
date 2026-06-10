import { Alert, Button, Form, Input, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DATE_FORMAT, ROUTES } from '@/config/constants';
import type { Role } from '@/config/permissions';
import { RoleAccessPreview } from '@/features/rbac/components/RoleAccessPreview/RoleAccessPreview';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { StatusPill } from '@/shared/ui/StatusPill/StatusPill';
import {
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '../../constants';
import { useUpdateUser } from '../../hooks/useUpdateUser';
import { useUser } from '../../hooks/useUser';
import type { UpdateUserRequest } from '../../schemas/user.schema';
import styles from './UserDetailForm.module.scss';

const STATUS_VARIANT = {
  active: 'completed',
  inactive: 'on-leave',
  invited: 'pending',
} as const;

interface UserDetailFormProps {
  userId: string;
}

export function UserDetailForm({ userId }: UserDetailFormProps) {
  const navigate = useNavigate();
  const [form] = Form.useForm<UpdateUserRequest>();
  const { data: user, isLoading, error } = useUser(userId);
  const { mutate, isPending } = useUpdateUser();
  const selectedRole = Form.useWatch('role', form) as Role | undefined;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
      });
    }
  }, [user, form]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Alert
        type="error"
        showIcon
        message="User not found"
        description={error instanceof Error ? error.message : 'Unable to load user details.'}
        action={
          <Button type="link" onClick={() => navigate(ROUTES.USERS)}>
            Back to users
          </Button>
        }
      />
    );
  }

  const handleFinish = (values: UpdateUserRequest) => {
    mutate({ id: userId, payload: values });
  };

  const previewRole = selectedRole ?? user.role;

  return (
    <div className={styles.layout}>
      <div className={styles.formColumn}>
      <CardWrapper
        title={user.name}
        subtitle={`Joined ${dayjs(user.joinedAt).format(DATE_FORMAT)}`}
        actions={
          user.updatedAt ? (
            <span className={styles.meta}>
              Last updated {dayjs(user.updatedAt).format(DATE_FORMAT)}
            </span>
          ) : undefined
        }
      >
        <div className={styles.summary}>
          <StatusPill
            label={STATUS_LABELS[user.status]}
            variant={STATUS_VARIANT[user.status]}
          />
          <span className={styles.summaryText}>
            {ROLE_LABELS[user.role]} · {DEPARTMENT_LABELS[user.department]}
          </span>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={false}
          className={styles.form}
        >
          <Form.Item
            name="name"
            label="Full name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input />
          </Form.Item>

          <div className={styles.row}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Role is required' }]}
              className={styles.field}
            >
              <Select options={ROLE_OPTIONS} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Status is required' }]}
              className={styles.field}
            >
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </div>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Department is required' }]}
          >
            <Select options={DEPARTMENT_OPTIONS} />
          </Form.Item>

          <div className={styles.actions}>
            <Button onClick={() => navigate(ROUTES.USERS)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Save changes
            </Button>
          </div>
        </Form>
      </CardWrapper>
      </div>

      <div className={styles.previewColumn}>
        <RoleAccessPreview role={previewRole} />
      </div>
    </div>
  );
}
