import { Alert, Button, Card, Typography } from 'antd';
import { useResetDatabase } from '../../hooks/useResetDatabase';

export const GeneralSettingsPanel = () => {
  const resetDatabase = useResetDatabase();

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
