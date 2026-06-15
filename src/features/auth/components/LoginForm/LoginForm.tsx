import { Alert, Button, Form, Input } from 'antd';
import { env } from '@/config/env';
import { DEV_MOCK_USERS } from '../../mock/devUsers';
import { useLogin } from '../../hooks/useLogin';
import type { LoginRequest } from '../../schemas/auth.schema';
import styles from './LoginForm.module.scss';

export function LoginForm() {
  const [form] = Form.useForm<LoginRequest>();
  const { mutate, isPending, error } = useLogin();

  const onFinish = (values: LoginRequest) => {
    mutate(values);
  };

  const devPassword = env.useAuthMock ? 'dev' : 'ps123';

  const fillDevAccount = (email: string) => {
    form.setFieldsValue({ email, password: devPassword });
  };

  const errorMessage =
    error instanceof Error ? error.message : 'Invalid email or password. Please try again.';

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      className={styles.form}
      initialValues={env.useAuthMock ? { password: 'dev' } : undefined}
    >
      {import.meta.env.DEV && (
        <Alert
          type="info"
          showIcon
          message={env.useAuthMock ? 'Dev auth mock active' : 'Local API auth'}
          description={
            <div className={styles.devHint}>
              <p>
                {env.useAuthMock
                  ? 'Any listed email works with any password. Quick fill:'
                  : `Seeded dev accounts use password "${devPassword}". Quick fill:`}
              </p>
              <div className={styles.devAccounts}>
                {DEV_MOCK_USERS.map((user) => (
                  <Button
                    key={user.email}
                    size="small"
                    type="link"
                    className={styles.devAccountButton}
                    onClick={() => fillDevAccount(user.email)}
                  >
                    {user.role}
                  </Button>
                ))}
              </div>
            </div>
          }
          className={styles.alert}
        />
      )}

      {error && (
        <Alert
          type="error"
          message="Login failed"
          description={errorMessage}
          showIcon
          className={styles.alert}
        />
      )}

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
        ]}
      >
        <Input placeholder="employee@pokeslide.dev" size="large" autoComplete="email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password placeholder={devPassword} size="large" autoComplete="current-password" />
      </Form.Item>

      <Form.Item className={styles.submit}>
        <Button type="primary" htmlType="submit" size="large" block loading={isPending}>
          Sign in
        </Button>
      </Form.Item>
    </Form>
  );
}
