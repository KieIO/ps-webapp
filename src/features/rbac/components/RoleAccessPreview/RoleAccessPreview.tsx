import { Tag } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { ROLE_LABELS, type Role } from '@/config/permissions';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { getRoleAccessSummary } from '../../utils/roleAccess';
import styles from './RoleAccessPreview.module.scss';

interface RoleAccessPreviewProps {
  role: Role;
}

export function RoleAccessPreview({ role }: RoleAccessPreviewProps) {
  const permissionConfig = useAppSelector((state) => state.permissionConfig.config);
  const { granted, denied } = getRoleAccessSummary(role, permissionConfig);

  return (
    <CardWrapper
      title="Effective access"
      subtitle={`Preview for ${ROLE_LABELS[role]} — changes when you select a different role`}
    >
      <div className={styles.section}>
        <h3 className={styles.heading}>Can access</h3>
        {granted.length === 0 ? (
          <p className={styles.empty}>No module access configured.</p>
        ) : (
          <ul className={styles.list}>
            {granted.map((entry) => (
              <li key={entry.moduleKey} className={styles.item}>
                <Tag color="success" className={styles.moduleTag}>
                  {entry.moduleLabel}
                </Tag>
                <span className={styles.actions}>{entry.actions.join(' · ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Not included</h3>
        {denied.length === 0 ? (
          <p className={styles.empty}>This role has access to all configured modules.</p>
        ) : (
          <div className={styles.deniedTags}>
            {denied.map((entry) => (
              <Tag key={entry.moduleKey} className={styles.deniedTag}>
                {entry.moduleLabel}
                {entry.plannedPhase ? ` (${entry.plannedPhase})` : ''}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <p className={styles.footer}>
        <Link to={ROUTES.ROLES}>View full permission matrix</Link>
      </p>
    </CardWrapper>
  );
}
