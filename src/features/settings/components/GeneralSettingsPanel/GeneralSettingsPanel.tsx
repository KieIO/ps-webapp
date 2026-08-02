import { Alert, Button, Card, Typography } from 'antd';
import { ROLES } from '@/config/permissions';
import { usePermission } from '@/shared/hooks/usePermission';
import { useResetDatabase } from '../../hooks/useResetDatabase';

export const GeneralSettingsPanel = () => {
  const { role } = usePermission();
  const resetDatabase = useResetDatabase();
  const canResetDatabase = role === ROLES.ADMIN;

  if (!canResetDatabase) {
    return (
      <Card title="General">
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          No general settings are available for your role.
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <Card title="Database">
      <Alert
        type="warning"
        showIcon
        message="Destructive action"
        description="Resetting the database removes all data created after the initial seed and restores the default dev dataset (users, titles, projects, tasks, and reference data)."
        style={{ marginBottom: 24 }}
      />

      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Use this when you want a clean environment. You will need to sign in again with a seed
        account after the reset completes.
      </Typography.Paragraph>

      <Button
        danger
        type="primary"
        loading={resetDatabase.isPending}
        onClick={() => resetDatabase.mutate()}
      >
        Reset database to seed data
      </Button>
    </Card>
  );
};
