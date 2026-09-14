import { useEffect, useState } from 'react';
import { Alert, Button, Card, InputNumber, Space, Typography } from 'antd';
import { env } from '@/config/env';
import { ROLES } from '@/config/permissions';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useOvertimeSettings,
  useUpdateOvertimeSettings,
} from '@/features/overtime/hooks/useOvertime';
import { useResetDatabase } from '../../hooks/useResetDatabase';
import styles from './GeneralSettingsPanel.module.scss';

export const GeneralSettingsPanel = () => {
  const { role, can } = usePermission();
  const resetDatabase = useResetDatabase();
  const canResetDatabase = role === ROLES.ADMIN && env.enableDatabaseReset;
  const canManageOtSettings =
    role === ROLES.ADMIN ||
    role === ROLES.HEAD ||
    role === ROLES.CREATIVE_HEAD ||
    can('APPROVE_OT');

  const settingsQuery = useOvertimeSettings(canManageOtSettings);
  const updateSettings = useUpdateOvertimeSettings();
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setThreshold(settingsQuery.data.alertThresholdHoursPerWeek);
    }
  }, [settingsQuery.data]);

  if (!canResetDatabase && !canManageOtSettings) {
    return (
      <Card title="General">
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          No general settings are available for your role.
        </Typography.Paragraph>
      </Card>
    );
  }

  return (
    <div className={styles.root}>
      {canManageOtSettings ? (
        <Card title="Overtime alerts">
          <Typography.Paragraph type="secondary">
            Cảnh báo khi nhân sự có tổng giờ OT ước tính trong tuần vượt ngưỡng.
          </Typography.Paragraph>
          <Space align="end" wrap>
            <div>
              <Typography.Text type="secondary">Ngưỡng giờ / tuần</Typography.Text>
              <div>
                <InputNumber
                  min={1}
                  step={1}
                  value={threshold}
                  onChange={(value) => setThreshold(value)}
                  disabled={settingsQuery.isLoading}
                  style={{ width: 160 }}
                />
              </div>
            </div>
            <Button
              type="primary"
              loading={updateSettings.isPending}
              disabled={threshold == null || threshold <= 0}
              onClick={() => {
                if (threshold == null) return;
                updateSettings.mutate({ alertThresholdHoursPerWeek: threshold });
              }}
            >
              Lưu
            </Button>
          </Space>
          {settingsQuery.isError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginTop: 16 }}
              message="Không tải được cài đặt OT"
            />
          ) : null}
        </Card>
      ) : null}

      {canResetDatabase ? (
        <Card title="Database">
          <Alert
            type="warning"
            showIcon
            message="Destructive action"
            description="Both options wipe current data and sign everyone out. Empty keeps catalogs and one account per core role. Seed restores the full demo dataset."
            style={{ marginBottom: 24 }}
          />

          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            After reset, sign in again with a seed account (password{' '}
            <Typography.Text code>ps123</Typography.Text>
            ), e.g. <Typography.Text code>admin@pokeslide.com</Typography.Text> or a{' '}
            <Typography.Text code>@pokeslide.dev</Typography.Text> role account.
          </Typography.Paragraph>

          <Space wrap>
            <Button
              danger
              type="primary"
              loading={resetDatabase.isPending && resetDatabase.variables === 'empty'}
              disabled={resetDatabase.isPending}
              onClick={() => resetDatabase.confirmAndReset('empty')}
            >
              Reset to empty
            </Button>
            <Button
              danger
              loading={resetDatabase.isPending && resetDatabase.variables === 'seed'}
              disabled={resetDatabase.isPending}
              onClick={() => resetDatabase.confirmAndReset('seed')}
            >
              Reset to seed data
            </Button>
          </Space>
        </Card>
      ) : null}
    </div>
  );
};
