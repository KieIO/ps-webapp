import { ROLE_LABELS, type Role } from '@/config/permissions';
import { CardWrapper } from '@/shared/ui/CardWrapper/CardWrapper';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import styles from './HomePlaceholder.module.scss';

interface HomePlaceholderProps {
  role: Role;
}

/**
 * Deferred Home layout — Employee (and any role without a dedicated dashboard).
 * Leadership → `HomeDashboard`; PM / Creative Manager → `ManagerHomeDashboard`.
 */
export function HomePlaceholder({ role }: HomePlaceholderProps) {
  const roleLabel = ROLE_LABELS[role];

  return (
    <div className={styles.root}>
      <PageHeader title="Home" subtitle={`${roleLabel} · layout sẽ được bổ sung sau`} />
      <CardWrapper title="Coming soon">
        <p className={styles.copy}>
          Trang Home dành cho <strong>{roleLabel}</strong> đang được thiết kế. Bạn vẫn có thể dùng{' '}
          <strong>Project Tracker</strong> và <strong>Task management</strong> từ sidebar.
        </p>
      </CardWrapper>
    </div>
  );
}
