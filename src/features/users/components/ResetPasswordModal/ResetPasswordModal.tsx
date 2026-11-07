import { Button, Form, Input, Modal, Typography, message } from 'antd';
import { useState } from 'react';
import { DEFAULT_INVITE_PASSWORD } from '../../constants';
import { useResetUserPassword } from '../../hooks/useResetUserPassword';
import styles from './ResetPasswordModal.module.scss';

interface ResetPasswordModalProps {
  open: boolean;
  userId: string;
  userName: string;
  onClose: () => void;
}

type ResetPasswordFormValues = {
  password?: string;
};

export function ResetPasswordModal({ open, userId, userName, onClose }: ResetPasswordModalProps) {
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const { mutate, isPending } = useResetUserPassword();
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);

  const handleClose = () => {
    form.resetFields();
    setRevealedPassword(null);
    onClose();
  };

  const handleCopy = async () => {
    if (!revealedPassword) return;
    try {
      await navigator.clipboard.writeText(revealedPassword);
      message.success('Password copied');
    } catch {
      message.error('Could not copy password');
    }
  };

  const handleFinish = (values: ResetPasswordFormValues) => {
    const password = values.password?.trim();
    mutate(
      { userId, password: password || undefined },
      {
        onSuccess: (result) => {
          form.resetFields();
          setRevealedPassword(result.password);
        },
      },
    );
  };

  if (revealedPassword) {
    return (
      <Modal
        title="Password reset"
        open={open}
        onCancel={handleClose}
        footer={[
          <Button key="copy" onClick={() => void handleCopy()}>
            Copy password
          </Button>,
          <Button key="done" type="primary" onClick={handleClose}>
            Done
          </Button>,
        ]}
        destroyOnHidden
      >
        <Typography.Paragraph>
          New password for <strong>{userName}</strong>. Share it securely — it will not be shown
          again here.
        </Typography.Paragraph>
        <div className={styles.passwordBox}>
          <Typography.Text code copyable={false} className={styles.passwordValue}>
            {revealedPassword}
          </Typography.Text>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Reset password"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Reset password"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ password: '' }}>
        <Typography.Paragraph type="secondary" className={styles.legend}>
          Set a new password for <strong>{userName}</strong>. Leave blank to use the default (
          {DEFAULT_INVITE_PASSWORD}). Existing sessions for this user will be signed out.
        </Typography.Paragraph>

        <Form.Item
          name="password"
          label="New password (optional)"
          extra={`Leave blank to use ${DEFAULT_INVITE_PASSWORD}.`}
          rules={[
            {
              validator: (_, value: string | undefined) => {
                const trimmed = value?.trim();
                if (!trimmed) return Promise.resolve();
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
      </Form>
    </Modal>
  );
}
