import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Checkbox, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { DATE_FORMAT } from '@/config/constants';
import { ROLE_LABELS, ROLE_ORDER, type Permission, type Role } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import {
  usePermissionDraft,
  useResetPermissionConfig,
  useSavePermissionConfig,
} from '../../hooks/useSavePermissionConfig';
import {
  configsAreEqual,
  isImmutableGrant,
  togglePermissionGrant,
} from '../../storage/permissionConfig.storage';
import { buildPermissionMatrixRows } from '../../utils/roleAccess';
import type { PermissionMatrixRow } from '../../utils/roleAccess';
import type { PermissionConfigMap } from '../../types';
import styles from './PermissionMatrix.module.scss';

interface AccessCellProps {
  granted: boolean;
  planned?: boolean;
  editable?: boolean;
  disabled?: boolean;
  onChange?: (granted: boolean) => void;
}

const AccessCell = ({
  granted,
  planned,
  editable,
  disabled,
  onChange,
}: AccessCellProps) => {
  if (planned) {
    return (
      <Tooltip title="Planned — permissions not configured yet">
        <Tag className={styles.plannedTag}>Soon</Tag>
      </Tooltip>
    );
  }

  if (editable && onChange) {
    return (
      <Checkbox
        checked={granted}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={granted ? 'Granted' : 'Not granted'}
      />
    );
  }

  return granted ? (
    <CheckOutlined className={styles.granted} aria-label="Granted" />
  ) : (
    <CloseOutlined className={styles.denied} aria-label="Not granted" />
  );
};

export function PermissionMatrix() {
  const savedConfig = useAppSelector((state) => state.permissionConfig.config);
  const [draftConfig, setDraftConfig] = useState<PermissionConfigMap>(savedConfig);
  const { isCustom, source, updatedAt } = usePermissionDraft();
  const { mutate: saveChanges, isPending: isSaving } = useSavePermissionConfig();
  const { mutate: resetDefaults, isPending: isResetting } = useResetPermissionConfig();

  useEffect(() => {
    setDraftConfig(savedConfig);
  }, [savedConfig]);

  const rows = useMemo(() => buildPermissionMatrixRows(draftConfig), [draftConfig]);
  const isDirty = !configsAreEqual(draftConfig, savedConfig);

  const handleToggle = (permission: Permission, role: Role, granted: boolean) => {
    setDraftConfig((current) => togglePermissionGrant(current, permission, role, granted));
  };

  const columns: ColumnsType<PermissionMatrixRow> = [
    {
      title: 'Module',
      dataIndex: 'moduleLabel',
      key: 'module',
      fixed: 'left',
      width: 180,
      onCell: (record) => ({
        rowSpan: record.isFirstInModule ? record.moduleRowSpan : 0,
      }),
      render: (label: string, record) =>
        record.isFirstInModule ? <span className={styles.moduleLabel}>{label}</span> : null,
    },
    {
      title: 'Action',
      dataIndex: 'actionLabel',
      key: 'action',
      fixed: 'left',
      width: 240,
      render: (label: string, record) => (
        <span className={styles.actionLabel}>
          {label}
          {record.plannedPhase && (
            <Tag className={styles.phaseTag}>{record.plannedPhase}</Tag>
          )}
        </span>
      ),
    },
    ...ROLE_ORDER.map((role) => ({
      title: ROLE_LABELS[role],
      key: role,
      align: 'center' as const,
      width: 130,
      render: (_: unknown, record: PermissionMatrixRow) => {
        const editable =
          record.accessType === 'permission' && Boolean(record.permission);
        const permission = record.permission;
        const immutable =
          editable && permission
            ? isImmutableGrant(permission, role)
            : false;

        return (
          <AccessCell
            granted={record.grants[role]}
            planned={record.accessType === 'planned'}
            editable={editable}
            disabled={!editable || record.accessType === 'universal' || immutable}
            onChange={
              permission
                ? (granted) => handleToggle(permission, role, granted)
                : undefined
            }
          />
        );
      },
    })),
  ];

  return (
    <CardWrapper
      title="Permission matrix"
      subtitle="Edit module access per role — saved to localStorage until backend is ready"
      actions={
        <Space wrap>
          {isCustom && <Tag color="blue">Custom overrides active</Tag>}
          {isDirty && <Tag color="gold">Unsaved changes</Tag>}
          <Button onClick={() => setDraftConfig(savedConfig)} disabled={!isDirty || isSaving}>
            Discard
          </Button>
          <Button
            danger
            onClick={() => resetDefaults()}
            loading={isResetting}
            disabled={!isCustom || isSaving}
          >
            Reset defaults
          </Button>
          <Button
            type="primary"
            onClick={() => saveChanges(draftConfig)}
            loading={isSaving}
            disabled={!isDirty}
          >
            Save changes
          </Button>
        </Space>
      }
    >
      <p className={styles.meta}>
        Storage: <strong>{source === 'localStorage' ? 'localStorage' : 'Built-in defaults'}</strong>
        {updatedAt ? ` · Last saved ${dayjs(updatedAt).format(DATE_FORMAT)}` : ''}
      </p>

      <Table
        className={styles.table}
        rowKey="key"
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1100 }}
        size="middle"
      />
    </CardWrapper>
  );
}
