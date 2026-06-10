import { Alert } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader';
import { PermissionMatrix } from '@/features/rbac/components/PermissionMatrix/PermissionMatrix';

export default function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Fixed organizational roles and their module access"
      />

      <Alert
        type="info"
        showIcon
        className="page-alert"
        message="Permissions stored in localStorage (temporary)"
        description={
          <>
            Changes apply to all users with the affected roles in this browser. Overrides persist
            in <code>localStorage</code> until the backend API is implemented — see{' '}
            <code>docs/RBAC_BACKEND_TODO.md</code> for the migration plan. Manage users from{' '}
            <Link to={ROUTES.USERS}>Users</Link>.
          </>
        }
        style={{ marginBottom: 24 }}
      />

      <PermissionMatrix />
    </div>
  );
}
